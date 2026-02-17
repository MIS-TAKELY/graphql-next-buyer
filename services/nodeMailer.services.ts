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

const TEMPLATES: Record<string, EmailTemplate> = {
  VERIFICATION: {
    subject: "Verify your email - Vanijay",
    text: (ctx) => `Please verify your email by clicking on this link: ${ctx.url}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Vanijay!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ctx.url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 0.8em;">Or copy and paste this link: <br/> <a href="${ctx.url}">${ctx.url}</a></p>
      </div>
    `,
  },
  VERIFICATION_OTP: {
    subject: "Your Verification Code - Vanijay",
    text: (ctx) => `Your verification code is: ${ctx.otp}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 12px 24px; background-color: #f8f9fa; color: #333; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; border: 1px solid #ddd;">${ctx.otp}</span>
        </div>
        <p style="color: #666; font-size: 0.9em;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  },
  PASSWORD_RESET: {
    subject: "Reset your password - Vanijay",
    text: (ctx) => `You requested a password reset. Use this link: ${ctx.url}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You recently requested to reset your password for your Vanijay account. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ctx.url}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">This link will expire soon. If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  },
  NEW_ORDER: {
    subject: "New Order Received! - Vanijay",
    text: (ctx) => `You have received a new order. Total: ${ctx.total}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Order Received!</h2>
        <p>Hello ${ctx.name || 'Seller'},</p>
        <p>You have received a new order on Vanijay.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 1.1em; font-weight: bold;">Order Summary:</p>
          <p style="margin: 10px 0 0 0;">Total Amount: NPR ${ctx.total}</p>
        </div>
        <p>Please log in to your dashboard to process the order.</p>
        <p style="color: #666; font-size: 0.9em;">Thank you for selling on Vanijay!</p>
      </div>
    `,
  },
  JOB_APPLICATION: {
    subject: "New Job Application Received - Vanijay",
    text: (ctx) => `New job application from ${ctx.name}. Email: ${ctx.email}, Phone: ${ctx.phone || 'N/A'}, Salary: ${ctx.salary}. The candidate's CV is attached to this email.`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Job Application</h2>
        <p>A new candidate has applied for a position at Vanijay.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${ctx.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${ctx.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${ctx.phone || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Expected Salary:</strong> ${ctx.salary}</p>
          <p style="margin: 15px 0 0 0;"><strong>CV/Resume:</strong> Attached to this email</p>
        </div>
        <p style="color: #666; font-size: 0.9em;">This application was submitted via the Careers page.</p>
      </div>
    `,
  },
  ORDER_CONFIRMED_BUYER: {
    subject: "Order Confirmed! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been placed successfully. Total: NPR ${ctx.total}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">🎉 Order Confirmed!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order has been placed successfully on Vanijay.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> NPR ${ctx.total}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${ctx.paymentProvider || 'N/A'}</p>
        </div>
        <p>We'll notify you when your order is shipped.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">Thank you for shopping on Vanijay!</p>
      </div>
    `,
  },
  PAYMENT_SUCCESS: {
    subject: "Payment Successful - Vanijay",
    text: (ctx) => `Payment of NPR ${ctx.amount} for order #${ctx.orderNumber} was successful via ${ctx.provider}.`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">✅ Payment Successful</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your payment has been verified and confirmed.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> NPR ${ctx.amount}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${ctx.provider}</p>
        </div>
        <p>Your order is now being processed.</p>
        <p style="color: #666; font-size: 0.9em;">Thank you for shopping on Vanijay!</p>
      </div>
    `,
  },
  ORDER_SHIPPED: {
    subject: "Your Order Has Been Shipped! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been shipped.${ctx.trackingNumber ? ` Tracking: ${ctx.trackingNumber}` : ''}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">📦 Order Shipped!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Great news! Your order has been shipped and is on its way.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          ${ctx.trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${ctx.trackingNumber}</p>` : ''}
          ${ctx.carrier ? `<p style="margin: 5px 0;"><strong>Carrier:</strong> ${ctx.carrier}</p>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">Thank you for shopping on Vanijay!</p>
      </div>
    `,
  },
  ORDER_DELIVERED: {
    subject: "Your Order Has Been Delivered! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been delivered. We hope you enjoy your purchase!`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">🎉 Order Delivered!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order has been successfully delivered.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
        </div>
        <p>We hope you love your purchase! If you have any issues, you can request a return within the return window.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Order</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">Thank you for shopping on Vanijay!</p>
      </div>
    `,
  },
  ORDER_CANCELLED: {
    subject: "Order Cancelled - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been cancelled.${ctx.reason ? ` Reason: ${ctx.reason}` : ''}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">❌ Order Cancelled</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order has been cancelled.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          ${ctx.reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.reason}</p>` : ''}
          ${ctx.refundNote ? `<p style="margin: 5px 0;"><strong>Refund:</strong> ${ctx.refundNote}</p>` : ''}
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p style="color: #666; font-size: 0.9em;">We're sorry to see this order cancelled. We hope to serve you again!</p>
      </div>
    `,
  },
  ORDER_CONFIRMED_STATUS: {
    subject: "Your Order Has Been Confirmed! - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} has been confirmed and is being prepared.`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">✅ Order Confirmed!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Great news! Your order has been confirmed by the seller and is being prepared for shipment.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
        </div>
        <p>We'll notify you once your order is shipped.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">Thank you for shopping on Vanijay!</p>
      </div>
    `,
  },
  ORDER_PROCESSING: {
    subject: "Your Order Is Being Processed - Vanijay",
    text: (ctx) => `Your order #${ctx.orderNumber} is now being processed and will be shipped soon.`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">⚙️ Order Being Processed</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your order is now being processed and packed for delivery.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
        </div>
        <p>We'll let you know when it's shipped!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">Thank you for shopping on Vanijay!</p>
      </div>
    `,
  },
  DISPUTE_SUBMITTED_BUYER: {
    subject: "Your Request Has Been Submitted - Vanijay",
    text: (ctx) => `Your ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} request for order #${ctx.orderNumber} has been submitted.`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff9800;">📋 ${ctx.disputeType === 'CANCEL' ? 'Cancellation' : 'Return'} Request Submitted</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} request has been submitted and is awaiting review.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Request Type:</strong> ${ctx.disputeType === 'CANCEL' ? 'Cancellation' : 'Return'}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.reason || 'N/A'}</p>
        </div>
        <p>The seller will review your request and respond shortly. We'll notify you once a decision is made.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Orders</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">If you have any questions, please contact our support team.</p>
      </div>
    `,
  },
  DISPUTE_SUBMITTED_SELLER: {
    subject: "New Dispute Request Received - Vanijay",
    text: (ctx) => `A customer has requested a ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} for order #${ctx.orderNumber}.`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">⚠️ New ${ctx.disputeType === 'CANCEL' ? 'Cancellation' : 'Return'} Request</h2>
        <p>Hello ${ctx.name || 'Seller'},</p>
        <p>A customer has submitted a ${ctx.disputeType === 'CANCEL' ? 'cancellation' : 'return'} request for one of your orders.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${ctx.customerName || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Request Type:</strong> ${ctx.disputeType === 'CANCEL' ? 'Cancellation' : 'Return'}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.reason || 'N/A'}</p>
        </div>
        <p>Please log in to your dashboard to review and respond to this request.</p>
        <p style="color: #666; font-size: 0.9em;">Prompt responses help maintain customer satisfaction.</p>
      </div>
    `,
  },
  RETURN_UPDATE: {
    subject: "Return Request Update - Vanijay",
    text: (ctx) => `Your return request for order #${ctx.orderNumber} has been updated to: ${ctx.status}`,
    html: (ctx) => `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6f42c1;">🔄 Return Request Update</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your return request has been updated.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${ctx.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${ctx.status}</p>
          ${ctx.rejectionReason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${ctx.rejectionReason}</p>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vanijay.com'}/account/orders" style="display: inline-block; padding: 12px 24px; background-color: #6f42c1; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Return Status</a>
        </div>
        <p style="color: #666; font-size: 0.9em;">If you have questions about your return, please contact our support team.</p>
      </div>
    `,
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
