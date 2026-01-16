import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Us - Vanijay | Zero Seller Charges | Best Prices in Nepal",
    description: "Learn about Vanijay, Nepal's premier online shopping platform. We offer the best prices on electronics, fashion, and home goods with zero charges for sellers.",
    openGraph: {
        title: "About Vanijay - Revolutionizing E-Commerce in Nepal",
        description: "Zero seller fees, best prices for buyers. Join the Vanijay revolution today.",
    }
};

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-primary sm:text-5xl">About Vanijay</h1>
                    <p className="mt-4 text-xl text-muted-foreground">
                        Empowering Nepal with fair, affordable, and seamless online shopping.
                    </p>
                </div>

                {/* Mission Statement */}
                <div className="prose prose-lg dark:prose-invert mx-auto">
                    <p>
                        At <strong>Vanijay</strong>, we belieive in democratizing e-commerce. Established with a vision to connect buyers and sellers across Nepal without the barrier of high commissions, we are proud to be one of the few platforms offering <strong>Zero Seller Charges</strong>. This means sellers earn more, and buyers get the <strong>Best Prices in Nepal</strong>.
                    </p>
                </div>

                {/* USPs Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-card p-6 rounded-lg shadow-sm border text-center">
                        <div className="text-4xl mb-4">💰</div>
                        <h3 className="text-xl font-bold mb-2">Best Prices Guaranteed</h3>
                        <p className="text-muted-foreground">By eliminating middleman fees, we ensure you get the lowest market rates on electronics and fashion.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg shadow-sm border text-center">
                        <div className="text-4xl mb-4">🤝</div>
                        <h3 className="text-xl font-bold mb-2">Zero Seller Fees</h3>
                        <p className="text-muted-foreground">We charge 0% commission to our sellers, empowering local businesses to thrive online.</p>
                    </div>
                    <div className="bg-card p-6 rounded-lg shadow-sm border text-center">
                        <div className="text-4xl mb-4">🚀</div>
                        <h3 className="text-xl font-bold mb-2">Fast & Easy</h3>
                        <p className="text-muted-foreground">Experience a user-friendly interface with fast delivery across Kathmandu and major cities.</p>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-primary/5 rounded-xl p-8 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-primary">Ready to experience the difference?</h2>
                    <div className="flex justify-center gap-4 pt-4">
                        <a href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition">
                            Start Shopping
                        </a>
                        <a href="/shop/register-seller" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-semibold hover:opacity-90 transition">
                            Become a Seller
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
