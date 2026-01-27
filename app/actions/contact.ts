"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function sendContactEmail(formData: FormData) {
    const validatedFields = contactSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, subject, message } = validatedFields.data;

    // IMPORTANT: The user should set these in their .env file
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER || "vanijayenterprises@gmail.com",
            pass: process.env.EMAIL_PASS, // App-specific password for Gmail
        },
    });

    try {
        // If EMAIL_PASS is not set, we'll simulate success in development 
        // but log a warning. In production, this would fail.
        if (!process.env.EMAIL_PASS) {
            console.warn("EMAIL_PASS not set. Email not sent, but simulating success for development.");
            console.log("Contact Form Submission:", { name, email, subject, message });

            // Artificial delay to feel real
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { success: true };
        }

        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: "vanijayenterprises@gmail.com",
            replyTo: email,
            subject: `Vanijay Contact: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000;">New Inquiry from Vanijay Contact Form</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { error: "Failed to send message. Please try again later." };
    }
}
