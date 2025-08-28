// servers/gql/modules/payment/payment.resolvers.ts
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!; // e.g., https://your-domain.com

export const paymentResolvers = {
  Mutation: {
    initiateEsewaPayment: async (_: any, { orderId }: any, ctx: any) => {
      const order = await ctx.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");

      const payment = await ctx.prisma.payment.create({
        data: {
          orderId,
          amount: order.total,
          currency: "NPR",
          status: "PENDING",
          provider: "ESEWA",
        },
      });

      const su = `${BASE_URL}/api/esewa/callback?status=success&pid=${payment.id}&orderId=${order.id}`;
      const fu = `${BASE_URL}/api/esewa/callback?status=failure&pid=${payment.id}&orderId=${order.id}`;

      const paymentUrl =
        `https://uat.esewa.com.np/epay/main` +
        `?amt=${order.total}` +
        `&pid=${payment.id}` +
        `&scd=EPAYTEST` +
        `&su=${encodeURIComponent(su)}` +
        `&fu=${encodeURIComponent(fu)}`;

      return { paymentUrl };
    },

    verifyEsewaPayment: async (_: any, { input }: any, ctx: any) => {
      const { paymentId, refId, amount } = input; // prefer paymentId over orderId

      const verifyRes = await fetch("https://uat.esewa.com.np/epay/transrec", {
        method: "POST",
        body: new URLSearchParams({
          amt: String(amount),
          scd: "EPAYTEST",
          pid: paymentId, // must match initiate pid
          rid: refId,
        }),
      }).then((r) => r.text());

      const success = verifyRes.includes("Success");

      return ctx.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: success ? "COMPLETED" : "FAILED",
          transactionId: refId,
        },
      });
    },
  },
};