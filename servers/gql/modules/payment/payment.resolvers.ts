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

      // Use environment variables for test credentials
      const ESEWA_GATEWAY_URL =
        process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np";
      const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
      const BACKEND_URI = process.env.BACKEND_URI || "http://localhost:3000";

      // Build callback URLs
      const su = `${BACKEND_URI}/api/esewa/callback?status=success&pid=${payment.id}&orderId=${order.id}`;
      const fu = `${BACKEND_URI}/api/esewa/callback?status=failure&pid=${payment.id}&orderId=${order.id}`;

      const paymentUrl = `${ESEWA_GATEWAY_URL}/epay/main?amt=${
        order.total
      }&pid=${payment.id}&scd=${ESEWA_PRODUCT_CODE}&su=${encodeURIComponent(
        su
      )}&fu=${encodeURIComponent(fu)}`;

      return { paymentUrl };
    },

    verifyEsewaPayment: async (_: any, { input }: any, ctx: any) => {
      const { orderId, refId, amount } = input;

      // Use environment variables for test credentials
      const ESEWA_GATEWAY_URL =
        process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np";
      const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

      const verifyRes = await fetch(`${ESEWA_GATEWAY_URL}/epay/transrec`, {
        method: "POST",
        body: new URLSearchParams({
          amt: amount.toString(),
          scd: ESEWA_PRODUCT_CODE,
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
