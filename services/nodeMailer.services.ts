import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "mailitttome@gmail.com",
    pass: "cqxaeszfinflvqot",
  },
});

// Wrap in an async IIFE so we can use await.
export const senMail = async (reciverEmail: string) => {
  try {
    console.log("recived email-->", reciverEmail);
    const info = await transporter.sendMail({
      from: '"Maddison Foo Koch" <mailitttome@gmail.com>',
      to: reciverEmail || "thereisamailforme@gmail.com",
      subject: "Hello ✔",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });

    console.log("Message sent:", info.messageId);

    return info;
  } catch (error: any) {
    console.log("error while sending email-->", error);
    console.error("error.message-->", error.message);
  }
};
