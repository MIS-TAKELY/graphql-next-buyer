import { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
    title: "Shopping Cart | Vanijay Nepal",
    description: "View and manage items in your shopping cart. Secure checkout and easy returns with Vanijay.",
    alternates: {
        canonical: "/cart",
    },
    robots: {
        index: false,
        follow: true,
    }
};

export default function CartPage() {
    return <CartPageClient />;
}
