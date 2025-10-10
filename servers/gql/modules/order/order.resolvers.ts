import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { generateOrderNumber } from "@/randomOrderNumber";
import { senMail } from "@/services/nodeMailer.services";
import { requireAuth, requireBuyer } from "../../auth/auth";
import { GraphQLContext } from "../../context";

// interface OrderInput {
//   items: Array<{
//     variantId: string;
//     quantity: number;
//   }>;
//   shippingAddress: any;
//   billingAddress?: any;
//   paymentProvider: string;
//   paymentMethodId?: string;
//   shippingMethod: string;
// }

interface DiscountCalculation {
  discountAmount: number;
  appliedDiscounts: Array<{
    amount: number;
    originalAmount: number;
  }>;
}

// Single Order Item
export interface OrderItemInput {
  variantId: string;
  quantity: number;
}

// Address Type
export interface AddressInput {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  [key: string]: any;
}

// Shipping Method Enum
export enum ShippingMethod {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
  SAME_DAY = "SAME_DAY",
}

// Payment Provider Enum
export enum PaymentProvider {
  COD = "COD",
  ESEWA = "ESEWA",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
}

// Single Order Input
export interface OrderInput {
  items: OrderItemInput[];
  shippingAddress: AddressInput;
  billingAddress?: AddressInput | null;
  paymentProvider: PaymentProvider;
  paymentMethodId?: string | null;
  shippingMethod: ShippingMethod;
}

type CreatedOrder = Prisma.OrderGetPayload<{
  include: {
    items: { include: { variant: true } };
    payments: true;
    shipments: true;
  };
}>;

export const orderResolvers = {
  Query: {
    getMyOrderItems: async (
      _: any,
      { limit, offset }: { limit: number; offset: number },
      ctx: GraphQLContext
    ) => {
      const user = requireBuyer(ctx);
      console.log("user--->", user);
      if (!user) throw new Error("Invalid user");

      return prisma.order.findMany({
        where: { buyerId: user.id },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          items: {
            select: {
              order: {
                select: {
                  orderNumber: true,
                  total: true,
                  createdAt: true,
                  status: true,
                },
              },
            },
          },
          // payments: true,
          // shipments: true,
          // appliedDiscounts: true,
          // discountUsage: true,
          // buyer: true,
        },
      });
    },
  },
  Mutation: {
    createOrder: async (
      _: any,
      { input }: { input: OrderInput },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      requireBuyer(ctx);

      // 1) Load variants and compute base pricing

      // console.log("orider input-->",input)
      const variantIds = input.items.map((i) => i.variantId);
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: {
            select: {
              id: true,
              status: true,
              sellerId: true,
              seller: {
                select: {
                  email: true,
                },
              },
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

        const unitPrice = v.price.toNumber();
        const totalPrice = i.quantity * unitPrice;
        subtotal += totalPrice;

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

      let discountCalculation: DiscountCalculation = {
        discountAmount: 0,
        appliedDiscounts: [],
      };

      const tax = Math.round(subtotal * 0.18);
      const shippingFee = 0;
      const discount = discountCalculation.discountAmount;
      const total = subtotal + tax + shippingFee - discount;
      const orderNumber = generateOrderNumber();

      try {
        const order = await prisma.$transaction(
          async (tx) => {
            const created = await tx.order.create({
              data: {
                orderNumber,
                buyerId: user.id,
                status: "PENDING",
                shippingSnapshot: input.shippingAddress,
                billingSnapshot: input.billingAddress ?? Prisma.JsonNull,
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
                    productCode: "",
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
            if (created) {
              console.log("ssending mail");
              const info = await senMail(variants[0].product.seller.email);
              console.log("mail response-->", info);
            }
            const itemsBySeller: Record<string, typeof computedItems> = {};
            for (const ci of computedItems) {
              if (!itemsBySeller[ci.sellerId]) {
                itemsBySeller[ci.sellerId] = [];
              }
              itemsBySeller[ci.sellerId].push(ci);
            }

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

            await Promise.all(
              computedItems.map((ci) =>
                tx.productVariant.update({
                  where: { id: ci.variantId },
                  data: { stock: { decrement: ci.quantity } },
                })
              )
            );

            // (f) Clear cart ---> optional
            // await tx.cartItem.deleteMany({
            //   where: { userId: user.id, variantId: { in: variantIds } },
            // });

            return created;
          },
          { timeout: 30000 }
        );

        // if (order) {
        //   senMail(variants[0].product.seller.email);
        // }

        console.log("order placed---->", order);

        return order;
      } catch (error: any) {
        console.error("Error while creating order:", error.message);
        throw new Error("Failed to create order");
      }
    },
    createOrders: async (
      _: any,
      { input }: { input: OrderInput[] },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      requireBuyer(ctx);
      console.log("input------>", input);

      const createdOrders: CreatedOrder[] = [];

      try {
        await prisma.$transaction(
          async (tx) => {
            for (const orderInput of input) {
              const variantIds = orderInput.items.map((i) => i.variantId);
              const variants = await tx.productVariant.findMany({
                where: { id: { in: variantIds } },
                include: {
                  product: {
                    select: {
                      id: true,
                      status: true,
                      sellerId: true,
                      categoryId: true,
                    },
                  },
                },
              });

              const byId = new Map(variants.map((v) => [v.id, v]));
              let subtotal = 0;

              const computedItems = orderInput.items.map((i) => {
                const v = byId.get(i.variantId);
                if (!v) throw new Error("Variant not found");
                if (v.product.status !== "ACTIVE")
                  throw new Error("Product inactive");
                if (v.stock !== null && v.stock < i.quantity)
                  throw new Error("Insufficient stock");

                const unitPrice = v.price.toNumber();
                const totalPrice = i.quantity * unitPrice;
                subtotal += totalPrice;

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

              const tax = Math.round(subtotal * 0.18);
              const shippingFee = 0;
              const discount = 0;
              const total = subtotal + tax + shippingFee - discount;
              const orderNumber = generateOrderNumber();

              const createdOrder = await tx.order.create({
                data: {
                  orderNumber,
                  buyerId: user.id,
                  status: "PENDING",
                  shippingSnapshot: orderInput.shippingAddress,
                  billingSnapshot: orderInput.billingAddress ?? Prisma.JsonNull,
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
                      provider: orderInput.paymentProvider,
                      methodId: orderInput.paymentMethodId ?? null,
                      productCode: "",
                    },
                  },
                  shipments: {
                    create: {
                      method: orderInput.shippingMethod as any,
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

              createdOrders.push(createdOrder);

              const itemsBySeller: Record<string, typeof computedItems> = {};
              for (const ci of computedItems) {
                if (!itemsBySeller[ci.sellerId])
                  itemsBySeller[ci.sellerId] = [];
                itemsBySeller[ci.sellerId].push(ci);
              }

              for (const [sellerId, items] of Object.entries(itemsBySeller)) {
                const sellerSubtotal = items.reduce(
                  (acc, i) => acc + Number(i.totalPrice),
                  0
                );
                const commissionRate = 0.1;
                const commission = Math.round(sellerSubtotal * commissionRate);

                await tx.sellerOrder.create({
                  data: {
                    buyerOrderId: createdOrder.id,
                    sellerId,
                    status: "PENDING",
                    subtotal: sellerSubtotal,
                    total: sellerSubtotal,
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
                });
              }

              await Promise.all(
                computedItems.map((ci) =>
                  tx.productVariant.update({
                    where: { id: ci.variantId },
                    data: { stock: { decrement: ci.quantity } },
                  })
                )
              );
            }
          },
          { timeout: 60000 }
        );

        return createdOrders;
      } catch (error: any) {
        console.error("Error while creating orders:", error.message);
        throw new Error("Failed to create orders");
      }
    },
  },
};
