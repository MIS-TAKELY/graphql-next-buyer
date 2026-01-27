import type { Metadata } from 'next';
import {
    HelpCircle,
    Search,
    ShoppingBag,
    ShieldCheck,
    RefreshCcw,
    CreditCard,
    Truck,
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Help Center - Vanijay",
    description: "Find answers to frequently asked questions and get support for your Vanijay experience.",
};

const categories = [
    {
        title: "Orders & Shipping",
        icon: <Truck className="w-6 h-6" />,
        questions: [
            "How do I track my order?",
            "What are the delivery charges?",
            "Do you provide international shipping?",
            "How long does delivery take?"
        ]
    },
    {
        title: "Returns & Refunds",
        icon: <RefreshCcw className="w-6 h-6" />,
        questions: [
            "What is the return policy?",
            "How do I initiate a return?",
            "How long does a refund take?",
            "Can I exchange a product?"
        ]
    },
    {
        title: "Payments",
        icon: <CreditCard className="w-6 h-6" />,
        questions: [
            "What payment methods are supported?",
            "Is Cash on Delivery available?",
            "Are my payment details secure?",
            "How do I pay with eSewa?"
        ]
    },
    {
        title: "Account & Security",
        icon: <ShieldCheck className="w-6 h-6" />,
        questions: [
            "How do I reset my password?",
            "How do I update my profile details?",
            "How do I verify my phone number?",
            "Is my personal data safe?"
        ]
    }
];

export default function HelpCenterPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Search Header */}
            <div className="bg-primary/5 py-16 px-4 border-b">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl font-extrabold text-foreground">How can we help you?</h1>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for articles, questions..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border bg-background shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="p-6 bg-card border rounded-2xl hover:shadow-md transition-shadow group">
                            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                {cat.icon}
                            </div>
                            <h2 className="text-lg font-bold mb-4">{cat.title}</h2>
                            <ul className="space-y-3">
                                {cat.questions.map((q, qIdx) => (
                                    <li key={qIdx}>
                                        <button className="text-sm text-left text-muted-foreground hover:text-primary transition-colors">
                                            {q}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Popular Topics Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-center">Popular Topics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-primary" />
                                Buying on Vanijay
                            </h3>
                            <p className="text-sm text-muted-foreground">Learn how to find products, use the cart, and complete your checkout smoothly.</p>
                            <Link href="/about" className="text-sm text-primary font-semibold hover:underline">Learn more &rarr;</Link>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-primary" />
                                Selling on Vanijay
                            </h3>
                            <p className="text-sm text-muted-foreground">Get started with listing your products and reaching customers across Nepal.</p>
                            <Link href="/contact" className="text-sm text-primary font-semibold hover:underline">Merchant Support &rarr;</Link>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-primary" />
                                Community Rules
                            </h3>
                            <p className="text-sm text-muted-foreground">Review our guidelines for buyers and sellers to ensure a fair marketplace.</p>
                            <Link href="/terms-conditions" className="text-sm text-primary font-semibold hover:underline">Read Terms &rarr;</Link>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="bg-primary p-8 rounded-3xl text-primary-foreground text-center space-y-6">
                    <h2 className="text-3xl font-extrabold">Still need help?</h2>
                    <p className="max-w-2xl mx-auto opacity-90">
                        Our support team is available from 9am to 6pm, Monday to Friday.
                        We aim to respond to all inquiries within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/contact"
                            className="px-8 py-3 bg-background text-primary font-bold rounded-xl hover:shadow-xl transition-all active:scale-95"
                        >
                            Contact Support
                        </Link>
                        <button className="px-8 py-3 bg-primary-foreground/10 border border-primary-foreground/20 font-bold rounded-xl hover:bg-primary-foreground/20 transition-all">
                            Live Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
