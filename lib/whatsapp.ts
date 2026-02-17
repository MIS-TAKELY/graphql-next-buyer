export async function sendWhatsAppMessage(phone: string, message: string) {
  const WPP_CONNECT = process.env.WPP_CONNECT;

  if (!WPP_CONNECT) {
    console.warn("WHATSAPP: WPP_CONNECT url not available, skipping");
    return;
  }

  const cleanPhone = phone.toString().replace(/\D/g, "");
  if (!cleanPhone) return;

  const MAX_RETRIES = 2;
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      const response = await fetch(WPP_CONNECT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, message }),
      });

      if (response.ok) {
        console.log(`✅ WhatsApp message sent to ${cleanPhone}`);
        return response.json();
      }

      const errorData = await response.text();
      console.error(`❌ WhatsApp API error (${response.status}):`, errorData);

      if (response.status === 503 && attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempt++;
        continue;
      }

      let errorMessage = "Failed to send WhatsApp message";
      try {
        const parsed = JSON.parse(errorData);
        errorMessage = parsed.details || parsed.error || errorMessage;
      } catch (e) {
        errorMessage = errorData || errorMessage;
      }

      throw new Error(errorMessage);
    } catch (error: any) {
      if (attempt >= MAX_RETRIES) {
        console.error("❌ WhatsApp send failed:", error.message);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempt++;
    }
  }
}

export async function sendWhatsAppOTP(phone: string, otp: string) {
  return sendWhatsAppMessage(phone, `Your verification code is: ${otp}`);
}
