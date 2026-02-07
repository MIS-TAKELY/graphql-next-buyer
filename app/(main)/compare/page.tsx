import { Metadata } from "next";
import ComparePageClient from "./ComparePageClient";

export const metadata: Metadata = {
    title: "Compare Products",
    description: "Compare features, specifications, and prices of different products side-by-side on Vanijay. Make informed buying decisions.",
    alternates: {
        canonical: "/compare",
    },
};

export default function ComparePage() {
    return <ComparePageClient />;
}
