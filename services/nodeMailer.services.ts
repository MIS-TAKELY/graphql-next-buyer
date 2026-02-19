import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("NODEMAILER: Transporter connection error:", error);
  } else {
    console.log("NODEMAILER: Server is ready to take our messages");
  }
});


type TemplateContext = {
  url?: string;
  name?: string;
  [key: string]: any;
};

type EmailTemplate = {
  subject: string;
  text: (context: TemplateContext) => string;
  html: (context: TemplateContext) => string;
};

const getEmailLayout = (content: string, subject: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com";
  const logoUrl = `${appUrl}/final_blue_logo_500by500.svg`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f7; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { padding: 30px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #f0f0f0; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 40px 30px; }
        .footer { padding: 30px; background-color: #f8f9fa; color: #6c757d; font-size: 13px; text-align: center; border-top: 1px solid #eeeeee; }
        .social-links { margin-bottom: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: #6c757d; text-decoration: none; }
        .social-links img { width: 24px; height: 24px; }
        .footer-links { margin-bottom: 15px; }
        .footer-links a { color: #007bff; text-decoration: none; margin: 0 8px; }
        .legal { font-size: 11px; color: #adb5bd; margin-top: 20px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff !important; color: #ffffff !important; text-decoration: none !important; border-radius: 5px; font-weight: 600; margin: 20px 0; }
        .otp-code { display: inline-block; padding: 15px 30px; background-color: #f8f9fa; color: #333; font-size: 28px; letter-spacing: 5px; font-weight: bold; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0; }
        .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Vanijay" class="logo">
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="social-links">
            <a href="https://www.facebook.com/VanijayEnterprises" title="Facebook"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="FB"></a>
            <a href="https://www.instagram.com/vanijay_enterprises" title="Instagram"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="IG"></a>
            <a href="https://x.com/Vanijay_Ent" title="X"><img src="https://cdn-icons-png.flaticon.com/512/3256/3256013.png" alt="X"></a>
            <a href="https://www.tiktok.com/@vanijay_enterprises" title="TikTok"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok"></a>
          </div>
          <div class="footer-links">
            <a href="${appUrl}/contact">Contact Us</a> | 
            <a href="${appUrl}/returns-policy">Returns</a> | 
            <a href="${appUrl}/shipping-policy">Shipping</a>
          </div>
          <p>&copy; ${new Date().getFullYear()} Vanijay. All rights reserved.</p>
          <p class="legal">
            This is an automatically generated email. Please do not reply to this email.<br>
            If you have any questions, visit our Help Center.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const TEMPLATES: Record<string, EmailTemplate> = {
  VERIFICATION: {
    subject: "Verify your email - Vanijay",
    text: (ctx) => `Please verify your email by clicking on this link: ${ctx.url}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Welcome to Vanijay!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Thank you for joining Vanijay. To get started, please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${ctx.url}" class="btn">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 0.8em; word-break: break-all;">Or copy and paste this link: <br/><a href="${ctx.url}">${ctx.url}</a></p>
    `, "Verify your email - Vanijay"),
  },
  VERIFICATION_OTP: {
    subject: "Your Verification Code - Vanijay",
    text: (ctx) => `Your verification code is: ${ctx.otp}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your verification code for Vanijay is:</p>
        <div style="text-align: center;">
          <span class="otp-code">${ctx.otp}</span>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
    `, "Your Verification Code - Vanijay"),
  },
  PASSWORD_RESET: {
    subject: "Reset your password - Vanijay",
    text: (ctx) => `You requested a password reset. Use this link: ${ctx.url}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Password Reset</h2>
        <p>Hello,</p>
        <p>You recently requested to reset your password for your Vanijay account. Click the button below to proceed:</p>
        <div style="text-align: center;">
          <a href="${ctx.url}" class="btn" style="background-color: #dc3545 !important;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">This link will expire soon. If you didn't request a password reset, please ignore this email.</p>
    `, "Reset your password - Vanijay"),
  },
  PASSWORD_RESET_OTP: {
    subject: "Your Password Reset Code - Vanijay",
    text: (ctx) => `Your password reset code is: ${ctx.otp}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Password Reset Code</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>You recently requested to reset your password for your Vanijay account. Your 6-digit verification code is:</p>
        <div style="text-align: center;">
          <span class="otp-code">${ctx.otp}</span>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
    `, "Your Password Reset Code - Vanijay"),
  },
  NEW_ORDER: {
    subject: "New Order Received! - Vanijay",
    text: (ctx) => `You have received a new order. Total: ${ctx.total}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">New Order Received!</h2>
        <p>Hello ${ctx.name || 'Seller'},</p>
        <p>Great news! You have received a new order on Vanijay.</p>
        <div class="info-box">
          <p style="margin: 0; font-size: 1.1em; font-weight: bold;">Order Summary:</p>
          <p style="margin: 10px 0 0 0;">Total Amount: <strong>NPR ${ctx.total}</strong></p>
        </div>
        <p>Please log in to your dashboard to process the order as soon as possible.</p>
        <p style="color: #666; font-size: 0.9em;">Thank you for selling on Vanijay!</p>
    `, "New Order Received! - Vanijay"),
  },
  JOB_APPLICATION: {
    subject: "New Job Application Received - Vanijay",
    text: (ctx) => `New job application from ${ctx.name}. Email: ${ctx.email}, Phone: ${ctx.phone || 'N/A'}, Salary: ${ctx.salary}. The candidate's CV is attached to this email.`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">New Job Application</h2>
        <p>A new candidate has applied for a position at Vanijay via the Careers page.</p>
        <div class="info-box" style="border-left-color: #6c757d;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${ctx.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${ctx.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${ctx.phone || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Expected Salary:</strong> ${ctx.salary}</p>
          <p style="margin: 15px 0 0 0;"><strong>CV/Resume:</strong> Attached to this email</p>
        </div>
    `, "New Job Application Received - Vanijay"),
  },
  ORDER_CONFIRMED_BUYER: {
    subject: "Order Placed Successfully! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been placed successfully on Vanijay. Total: NPR ${ctx.total}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #28a745; margin-top: 0;">🎉 Order Placed Successfully!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order has been placed successfully on Vanijay and is now being processed.</p>
        <div class="info-box" style="border-left-color: #28a745;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> NPR ${ctx.total}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${ctx.paymentProvider || 'N/A'}</p>
        </div>
        <p>We'll notify you when your order is shipped. You can track your order status in your account.</p>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" class="btn">Track Your Order</a>
        </div>
    `, "Order Placed Successfully! - Vanijay"),
  },
  PAYMENT_SUCCESS: {
    subject: "Payment Successful - Vanijay",
    text: (ctx) => `Payment of NPR ${ctx.amount} for order #${ctx.orderNumber} was successful via ${ctx.provider}.`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #28a745; margin-top: 0;">✅ Payment Successful</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your payment has been successfully verified and confirmed.</p>
        <div class="info-box" style="border-left-color: #28a745;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> NPR ${ctx.amount}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${ctx.provider}</p>
        </div>
        <p>Your order is now moving to the next stage of processing.</p>
    `, "Payment Successful - Vanijay"),
  },
  ORDER_SHIPPED: {
    subject: "Your Order Has Been Shipped! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been shipped.${ctx.trackingNumber ? ` Tracking: ${ctx.trackingNumber}` : ''}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #007bff; margin-top: 0;">📦 Order Shipped!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        <div class="info-box">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          ${ctx.trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${ctx.trackingNumber}</p>` : ''}
          ${ctx.carrier ? `<p style="margin: 5px 0;"><strong>Carrier:</strong> ${ctx.carrier}</p>` : ''}
        </div>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" class="btn">Track Your Order</a>
        </div>
    `, "Your Order Has Been Shipped! - Vanijay"),
  },
  ORDER_DELIVERED: {
    subject: "Your Order Has Been Delivered! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been delivered. We hope you enjoy your purchase!`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #28a745; margin-top: 0;">🎉 Order Delivered!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order has been successfully delivered. We hope you love your purchase!</p>
        <div class="info-box" style="border-left-color: #28a745;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
        </div>
        <p>If you have any issues with your items, you can request a return within the eligible return window.</p>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" class="btn" style="background-color: #28a745 !important;">View Order Details</a>
        </div>
    `, "Your Order Has Been Delivered! - Vanijay"),
  },
  ORDER_CANCELLED: {
    subject: "Order Cancelled - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been cancelled.${ctx.reason ? ` Reason: ${ctx.reason}` : ''}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #dc3545; margin-top: 0;">❌ Order Cancelled</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order has been cancelled.</p>
        <div class="info-box" style="border-left-color: #dc3545;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          ${ctx.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.reason}</p>` : ''}
          ${ctx.refundNote ? `<p style="margin: 5px 0;"><strong>Refund Note:</strong> ${ctx.refundNote}</p>` : ''}
        </div>
        <p>If you have any questions regarding this cancellation, please reach out to our support team.</p>
    `, "Order Cancelled - Vanijay"),
  },
  ORDER_CONFIRMED_STATUS: {
    subject: "Your Order Has Been Confirmed! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been confirmed and is being prepared.`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #28a745; margin-top: 0;">✅ Order Confirmed!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Great news! Your order has been confirmed by the seller and is being prepared for shipment.</p>
        <div class="info-box" style="border-left-color: #28a745;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
        </div>
        <p>We'll notify you once your order is on its way.</p>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" class="btn">Track Your Order</a>
        </div>
    `, "Your Order Has Been Confirmed! - Vanijay"),
  },
  ORDER_PROCESSING: {
    subject: "Your Order Is Being Processed - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} is now being processed and will be shipped soon.`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #007bff; margin-top: 0;">⚙️ Order Being Processed</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order is now being processed and packed for delivery.</p>
        <div class="info-box">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
        </div>
        <p>We'll let you know as soon as it's shipped!</p>
    `, "Your Order Is Being Processed - Vanijay"),
  },
  DISPUTE_SUBMITTED_BUYER: {
    subject: "Your Request Has Been Submitted - Vanijay",
    text: (ctx) => `Your ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} request for order #${ctx.orderNumber} has been submitted.`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #ff9800; margin-top: 0;">📋 Request Submitted</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} request has been submitted and is awaiting review.</p>
        <div class="info-box" style="border-left-color: #ff9800;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Request Type:</strong> ${ctx.disputeType === 'CANCEL' ? 'Cancellation' : 'Return'}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.reason || 'N/A'}</p>
        </div>
        <p>The seller will review your request shortly. We'll notify you once a decision is made.</p>
    `, "Your Request Has Been Submitted - Vanijay"),
  },
  DISPUTE_SUBMITTED_SELLER: {
    subject: "New Dispute Request Received - Vanijay",
    text: (ctx) => `A customer has requested a ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} for order #${ctx.orderNumber}.`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #dc3545; margin-top: 0;">⚠️ New ${ctx.disputeType === 'CANCEL' ? 'Cancellation' : 'Return'} Request</h2>
        <p>Hello ${ctx.name || 'Seller'},</p>
        <p>A customer has submitted a ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} request for one of your orders.</p>
        <div class="info-box" style="border-left-color: #dc3545;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${ctx.customerName || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.reason || 'N/A'}</p>
        </div>
        <p>Please log in to your dashboard to review and respond to this request promptly.</p>
    `, "New Dispute Request Received - Vanijay"),
  },
  RETURN_UPDATE: {
    subject: "Return Request Update - Vanijay",
    text: (ctx) => `Your return request for order #${ctx.orderNumber} has been updated to: ${ctx.status}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #6f42c1; margin-top: 0;">🔄 Return Request Update</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your return request for order #${ctx.orderNumber} has been updated.</p>
        <div class="info-box" style="border-left-color: #6f42c1;">
          <p style="margin: 5px 0;"><strong>Status:</strong> ${ctx.status}</p>
          ${ctx.rejectionReason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.rejectionReason}</p>` : ''}
        </div>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" class="btn" style="background-color: #6f42c1 !important;">View Status</a>
        </div>
    `, "Return Request Update - Vanijay"),
  },
};

export const senMail = async (
  receiverEmail: string,
  templateKey: keyof typeof TEMPLATES,
  context: TemplateContext,
  attachments?: nodemailer.SendMailOptions["attachments"]
) => {
  console.log("---------------- SENMAIL CALLED ----------------");
  try {
    const template = TEMPLATES[templateKey];
    if (!template) {
      throw new Error(`Template "${templateKey}" not found`);
    }

    console.log(`NODEMAILER: Attempting to send ${templateKey} email to:`, receiverEmail);

    const info = await transporter.sendMail({
      from: '"Vanijay" <mailitttome@gmail.com>',
      to: receiverEmail,
      subject: template.subject,
      text: template.text(context),
      html: template.html(context),
      attachments,
    });

    console.log("NODEMAILER: Message sent successfully:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("NODEMAILER: Error while sending email:", error.message);
    if (error.stack) console.error(error.stack);
    throw error;
  }
};
