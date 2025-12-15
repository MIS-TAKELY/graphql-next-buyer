import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Vanijoy E-Commerce",
    description: "Learn about Vanijoy, our mission to provide the best e-commerce experience with quality products and exceptional customer service.",
    openGraph: {
        title: "About Us | Vanijoy E-Commerce",
        description: "Learn about Vanijoy, our mission to provide the best e-commerce experience.",
    },
};

export default function AboutPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-4xl font-bold mb-6">About Us</h1>
            <div className="prose max-w-none dark:prose-invert">
                <p className="text-lg mb-4">
                    Welcome to Vanijoy, your number one source for all things [Product Category]. We're dedicated to giving you the very best of product, with a focus on dependability, customer service, and uniqueness.
                </p>
                <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
                <p className="mb-4">
                    Founded in 2024, Vanijoy has come a long way from its beginnings. When we first started out, our passion for eco-friendly and affordable products drove us to do tons of research so that Vanijoy can offer you the world's most advanced e-commerce experience.
                </p>
                <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us?</h2>
                <ul className="list-disc pl-6 mb-4">
                    <li>Top quality products</li>
                    <li>Best customer service</li>
                    <li>30-days money back guarantee</li>
                </ul>
            </div>
        </div>
    );
}
