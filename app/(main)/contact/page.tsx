import { Metadata } from "next";
import ContactClient from "./ContactClient";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.vanijay.com';

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Have a question or need support? Reach out to the Vanijay team. We're here to help you with your online shopping experience.",
    alternates: {
        canonical: `${baseUrl}/contact`,
    }
};

export default function ContactPage() {
    return <ContactClient />;
}
