import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pid = searchParams.get("pid");
    const orderId = searchParams.get("orderId");
    const refId = searchParams.get("refId");
    const amt = searchParams.get("amt");

    // console.log("eSewa Callback received:", {
    //   status,
    //   pid,
    //   orderId,
    //   refId,
    //   amt,
    // });

    if (!pid || !orderId) {
      console.error("Missing required parameters");
      return NextResponse.redirect(
        new URL("/buy-now?error=missing_params", request.url)
      );
    }

    // Redirect to buy-now page with callback parameters
    const redirectUrl = new URL("/buy-now", request.url);
    redirectUrl.searchParams.set("callback", "true");
    redirectUrl.searchParams.set("status", status || "unknown");
    redirectUrl.searchParams.set("pid", pid);
    redirectUrl.searchParams.set("orderId", orderId);
    if (refId) redirectUrl.searchParams.set("refId", refId);
    if (amt) redirectUrl.searchParams.set("amt", amt);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("eSewa callback error:", error);
    return NextResponse.redirect(
      new URL("/buy-now?error=callback_failed", request.url)
    );
  }
}
