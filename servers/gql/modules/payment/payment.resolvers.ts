export const paymentResolvers = {
  Mutation: {
    initiateEsewaPayment: async (_: any, { orderId }: any, ctx: any) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: orderId },
      });
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

      const paymentUrl = `https://uat.esewa.com.np/epay/main?q=fu
      &amt=${order.total}
      &pid=${payment.id}
      &scd=EPAYTEST
      &su=https://your-api.com/esewa/success
      &fu=https://your-api.com/esewa/failure`;

      return { paymentUrl };
    },

    verifyEsewaPayment: async (_: any, { input }: any, ctx: any) => {
      const { orderId, refId, amount } = input;

      const verifyRes = await fetch("https://uat.esewa.com.np/epay/transrec", {
        method: "POST",
        body: new URLSearchParams({
          amt: amount.toString(),
          scd: "EPAYTEST",
          pid: orderId,
          rid: refId,
        }),
      }).then((r) => r.text());

      const success = verifyRes.includes("Success");

      return ctx.prisma.payment.update({
        where: { orderId },
        data: {
          status: success ? "COMPLETED" : "FAILED",
          transactionId: refId,
        },
      });
    },
  },
};
