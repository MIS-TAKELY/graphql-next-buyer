import { Prisma } from "../../../../app/generated/prisma";
import { prisma } from "../../../../lib/db/prisma";
import { generateOrderNumber } from "@/randomOrderNumber";
import { senMail } from "@/services/nodeMailer.services";
import { rateLimit } from "@/services/rateLimit.service";
import { delCache } from "@/services/redis.services";
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
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                },
              },
            },
          },
          payments: true,
          shipments: true,
        },
      });
    },
  },
  Mutation: {
    createOrder: async (
      _: any,
      { input }: { input: OrderInput[] },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      requireBuyer(ctx);
      console.log("input------>", input);

      // Rate Limit: 5 orders per minute per user to prevent abuse
      const allowed = await rateLimit(`rate_limit:order:${user.id}`, 5, 60);
      if (!allowed) {
        throw new Error("Too many order attempts. Please wait a minute.");
      }

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
                      slug: true,
                      seller: {
                        select: {
                          email: true,
                          phone: true,
                        },
                      },
                    },
                  },
                },
              });

              console.log("orderInput-->", orderInput);

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

              const tax = 0; // Taxes removed per user request
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
                      currency: "NPR", // Switched from INR to NPR
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
                const commission = 0; // Commission removed per user request

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
                        commission: 0,
                      })),
                    },
                  },
                });
              }

              // Fix Race Condition: Use updateMany with 'gte' check to ensure sufficient stock at the exact moment of write.
              for (const ci of computedItems) {
                const res = await tx.productVariant.updateMany({
                  where: {
                    id: ci.variantId,
                    stock: { gte: ci.quantity },
                  },
                  data: {
                    stock: { decrement: ci.quantity },
                  },
                });

                if (res.count === 0) {
                  throw new Error(
                    `Insufficient stock for item (Race condition detected)`
                  );
                }
              }
            }
          },
          { timeout: 60000 }
        );

        // Invalidate cache for affected products (Stock update)
        for (const orderInput of input) {
          const variantIds = orderInput.items.map((i) => i.variantId);
          // We need to re-fetch or assume distinct slugs from the transaction block.
          // Simpler to just re-fetch slugs for invalidation safely outside tx.
          const products = await prisma.product.findMany({
            where: { variants: { some: { id: { in: variantIds } } } },
            select: { slug: true },
          });

          for (const p of products) {
            console.log(`🗑️ Invalidating cache for product: ${p.slug}`);
            const PRODUCT_CACHE_VERSION = 'v2';
            await delCache(`product:details:${PRODUCT_CACHE_VERSION}:${p.slug}`);
          }
        }

        // Send emails to each unique seller for each order after transaction
        for (const orderInput of input) {
          const variantIds = orderInput.items.map((i) => i.variantId);
          const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: {
              product: {
                select: {
                  id: true,
                  status: true,
                  sellerId: true,
                  categoryId: true,
                  seller: {
                    select: {
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          });

          const computedItems = orderInput.items.map((i) => {
            const v = variants.find((vv) => vv.id === i.variantId);
            if (!v) throw new Error("Variant not found");

            const unitPrice = v.price.toNumber();
            const totalPrice = i.quantity * unitPrice;

            return {
              variantId: i.variantId,
              quantity: i.quantity,
              unitPrice,
              totalPrice,
              sellerId: v.product.sellerId,
            };
          });

          const itemsBySeller: Record<string, typeof computedItems> = {};
          for (const ci of computedItems) {
            if (!itemsBySeller[ci.sellerId]) itemsBySeller[ci.sellerId] = [];
            itemsBySeller[ci.sellerId].push(ci);
          }

          for (const [sellerId, items] of Object.entries(itemsBySeller)) {
            const seller = variants.find((v) => v.product.sellerId === sellerId)
              ?.product.seller;

            if (seller?.email) {
              console.log("sending mail to seller:", seller.email);
              const info = await senMail(seller.email);
              console.log("mail response-->", info);
            }

            if (seller?.phone) {
              const sellerTotal = items.reduce(
                (acc, i) => acc + Number(i.totalPrice),
                0
              );

              // Construct WhatsApp message - FIXED: Added backticks for template literal
              const message = `🛒 New Order Received!
                Order Total: रु${sellerTotal}
                Customer: ${user.firstName || ""} ${user.lastName || ""}
                Phone: ${user.phone || "N/A"}`;

              // Send WhatsApp via your worker
              console.log("sending whatsapp to seller:", seller.phone);

              try {
                const wppConnectUrl = process.env.WPP_CONNECT;

                if (!wppConnectUrl) {
                  throw new Error(
                    "WPP_CONNECT environment variable is not defined"
                  );
                }

                await fetch(wppConnectUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    phone: seller.phone.toString(),
                    message,
                  }),
                });
              } catch (whatsappError) {
                console.error("Failed to send WhatsApp:", whatsappError);
                // Don't throw - allow order to complete even if WhatsApp fails
              }
            }
          }
        }

        return createdOrders;
      } catch (error: any) {
        console.error("Error while creating orders:", error.message);
        throw new Error("Failed to create orders");
      }
    },
  },
};
