import { prisma } from "@/lib/db/prisma";
import { generateOrderNumber } from "@/randomOrderNumber";
import { requireAuth, requireBuyer } from "../../auth/auth";

interface OrderInput {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  shippingAddress: any;
  billingAddress?: any;
  paymentProvider: string;
  paymentMethodId?: string;
  shippingMethod: string;
  couponCode?: string; // Added coupon support
}

interface DiscountCalculation {
  discountAmount: number;
  appliedDiscounts: Array<{
    discountId: string;
    couponId?: string;
    amount: number;
    originalAmount: number;
  }>;
}

export const orderResolvers = {
  Mutation: {
    createOrder: async (_: any, { input }: { input: OrderInput }, ctx: any) => {
      const user = requireAuth(ctx);
      requireBuyer(ctx);

      // 1) Load variants and compute base pricing
      const variantIds = input.items.map((i) => i.variantId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: {
            select: {
              id: true,
              status: true,
              sellerId: true,
              salePrice: true,
              saleStart: true,
              saleEnd: true,
              categoryId: true,
            },
          },
        },
      });

      const byId = new Map(variants.map((v) => [v.id, v]));
      let subtotal = 0;
      const computedItems = input.items.map((i) => {
        const v = byId.get(i.variantId);
        if (!v) throw new Error("Variant not found");
        if (v.product.status !== "ACTIVE") throw new Error("Product inactive");
        if (v.stock !== null && v.stock < i.quantity)
          throw new Error("Insufficient stock");

        // Check for sale price
        const now = new Date();
        let unitPrice = v.price;

        if (
          v.product.salePrice &&
          v.product.saleStart &&
          v.product.saleEnd &&
          now >= v.product.saleStart &&
          now <= v.product.saleEnd
        ) {
          unitPrice = v.product.salePrice;
        }

        const totalPrice = unitPrice.mul(i.quantity);
        subtotal += Number(totalPrice);

        return {
          variantId: i.variantId,
          quantity: i.quantity,
          unitPrice,
          totalPrice,
          sellerId: v.product.sellerId,
          productId: v.product.id,
          categoryId: v.product.categoryId,
        };
      });

      // 2) Calculate discounts if coupon provided
      let discountCalculation: DiscountCalculation = {
        discountAmount: 0,
        appliedDiscounts: [],
      };

      if (input.couponCode) {
        discountCalculation = await calculateDiscounts(
          input.couponCode,
          computedItems,
          subtotal,
          user.id
        );
      }

      const tax = Math.round(subtotal * 0.18);
      const shippingFee = 0;
      const discount = discountCalculation.discountAmount;
      const total = subtotal + tax + shippingFee - discount;
      const orderNumber = generateOrderNumber();

      try {
        // 3) Persist everything in ONE transaction
        const order = await prisma.$transaction(
          async (tx) => {
            // (a) Create main Order + Items + Payment + Shipment
            const created = await tx.order.create({
              data: {
                orderNumber,
                buyerId: user.id,
                status: "PENDING",
                shippingSnapshot: input.shippingAddress,
                billingSnapshot: input.billingAddress ?? null,
                subtotal,
                tax,
                shippingFee,
                discount,
                total,
                items: {
                  create: computedItems.map((ci) => ({
                    variantId: ci.variantId,
                    quantity: ci.quantity,
                    unitPrice: ci.unitPrice,
                    totalPrice: ci.totalPrice,
                  })),
                },
                payments: {
                  create: {
                    amount: total,
                    currency: "INR",
                    status: "PENDING",
                    provider: input.paymentProvider,
                    methodId: input.paymentMethodId ?? null,
                  },
                },
                shipments: {
                  create: {
                    method: input.shippingMethod as any,
                    status: "PENDING",
                  },
                },
              },
              include: {
                items: { include: { variant: true } },
                payments: true,
                shipments: true,
              },
            });

            // (b) Create discount-related entries
            if (discountCalculation.appliedDiscounts.length > 0) {
              for (const appliedDiscount of discountCalculation.appliedDiscounts) {
                // Create AppliedDiscount record
                await tx.appliedDiscount.create({
                  data: {
                    orderId: created.id,
                    discountId: appliedDiscount.discountId,
                    couponId: appliedDiscount.couponId,
                    discountAmount: appliedDiscount.amount,
                    originalAmount: appliedDiscount.originalAmount,
                  },
                });

                // Create DiscountUsage record
                await tx.discountUsage.create({
                  data: {
                    discountId: appliedDiscount.discountId,
                    userId: user.id,
                    orderId: created.id,
                  },
                });

                // Update coupon usage count if coupon was used
                if (appliedDiscount.couponId) {
                  await tx.coupon.update({
                    where: { id: appliedDiscount.couponId },
                    data: { usageCount: { increment: 1 } },
                  });
                }
              }
            }

            // (c) Group items by seller
            const itemsBySeller: Record<string, typeof computedItems> = {};
            for (const ci of computedItems) {
              if (!itemsBySeller[ci.sellerId]) {
                itemsBySeller[ci.sellerId] = [];
              }
              itemsBySeller[ci.sellerId].push(ci);
            }

            // (d) Create SellerOrders + SellerOrderItems
            for (const [sellerId, items] of Object.entries(itemsBySeller)) {
              const sellerSubtotal = items.reduce(
                (acc, i) => acc + Number(i.totalPrice),
                0
              );
              const commissionRate = 0.1; // 10% marketplace fee
              const commission = Math.round(sellerSubtotal * commissionRate);

              await tx.sellerOrder.create({
                data: {
                  buyerOrderId: created.id,
                  sellerId,
                  status: "PENDING",
                  subtotal: sellerSubtotal,
                  total: sellerSubtotal, // or subtotal - commission for net earnings
                  commission,
                  items: {
                    create: items.map((ci) => ({
                      variantId: ci.variantId,
                      quantity: ci.quantity,
                      unitPrice: ci.unitPrice,
                      totalPrice: ci.totalPrice,
                      commission: Math.round(
                        Number(ci.totalPrice) * commissionRate
                      ),
                    })),
                  },
                },
                include: { items: true },
              });
            }

            // (e) Decrement stock
            await Promise.all(
              computedItems.map((ci) =>
                tx.productVariant.update({
                  where: { id: ci.variantId },
                  data: { stock: { decrement: ci.quantity } },
                })
              )
            );

            // (f) Clear cart
            await tx.cartItem.deleteMany({
              where: { userId: user.id, variantId: { in: variantIds } },
            });

            return created;
          },
          { timeout: 30000 }
        );

        return order;
      } catch (error: any) {
        console.error("Error while creating order:", error.message);
        throw new Error("Failed to create order");
      }
    },
  },
};

// Helper function to calculate discounts
async function calculateDiscounts(
  couponCode: string,
  items: any[],
  subtotal: number,
  userId: string
): Promise<DiscountCalculation> {
  // Find the coupon and its discount
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
      status: "ACTIVE",
    },
    include: {
      discount: {
        include: {
          productDiscounts: true,
          categoryDiscounts: true,
        },
      },
    },
  });

  if (!coupon) {
    throw new Error("Invalid or inactive coupon code");
  }

  const discount = coupon.discount;
  const now = new Date();

  // Check if discount is valid
  if (
    !discount.isActive ||
    now < discount.startDate ||
    now > discount.endDate
  ) {
    throw new Error("Discount is not currently valid");
  }

  // Check usage limits
  if (discount.maxUsageTotal && coupon.usageCount >= discount.maxUsageTotal) {
    throw new Error("Coupon usage limit exceeded");
  }

  if (discount.maxUsagePerUser) {
    const userUsageCount = await prisma.discountUsage.count({
      where: {
        discountId: discount.id,
        userId: userId,
      },
    });

    if (userUsageCount >= discount.maxUsagePerUser) {
      throw new Error("User coupon usage limit exceeded");
    }
  }

  // Check minimum amount
  if (discount.minimumAmount && subtotal < Number(discount.minimumAmount)) {
    throw new Error(
      `Minimum order amount of ${discount.minimumAmount} required`
    );
  }

  let discountAmount = 0;
  let applicableAmount = subtotal;

  // Calculate discount based on scope
  switch (discount.scope) {
    case "CART":
      applicableAmount = subtotal;
      break;

    case "PRODUCT":
      // Only apply to specific products
      const productIds = discount.productDiscounts.map((pd) => pd.productId);
      applicableAmount = items
        .filter((item) => productIds.includes(item.productId))
        .reduce((sum, item) => sum + Number(item.totalPrice), 0);
      break;

    case "CATEGORY":
      // Only apply to specific categories
      const categoryIds = discount.categoryDiscounts.map((cd) => cd.categoryId);
      applicableAmount = items
        .filter(
          (item) => item.categoryId && categoryIds.includes(item.categoryId)
        )
        .reduce((sum, item) => sum + Number(item.totalPrice), 0);
      break;

    default:
      applicableAmount = subtotal;
  }

  if (applicableAmount === 0) {
    throw new Error("Coupon is not applicable to items in your cart");
  }

  // Calculate discount amount based on type
  switch (discount.type) {
    case "PERCENTAGE":
      discountAmount = Math.round(
        applicableAmount * (Number(discount.percentage) / 100)
      );
      if (
        discount.maximumDiscount &&
        discountAmount > Number(discount.maximumDiscount)
      ) {
        discountAmount = Number(discount.maximumDiscount);
      }
      break;

    case "FIXED_AMOUNT":
      discountAmount = Math.min(Number(discount.value), applicableAmount);
      break;

    case "FREE_SHIPPING":
      // Handle free shipping logic here if needed
      discountAmount = 0; // Assuming shipping fee is handled separately
      break;

    default:
      discountAmount = 0;
  }

  return {
    discountAmount,
    appliedDiscounts: [
      {
        discountId: discount.id,
        couponId: coupon.id,
        amount: discountAmount,
        originalAmount: applicableAmount,
      },
    ],
  };
}
