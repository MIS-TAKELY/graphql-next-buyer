import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";
import Link from "next/link";
import {
    Home,
    Info,
    Phone,
    Briefcase,
    ShieldCheck,
    FileText,
    RefreshCcw,
    Truck,
    ShoppingBag,
    Layers,
    BookOpen,
    Map
} from "lucide-react";

export const metadata: Metadata = {
    title: "Sitemap | Vanijay",
    description: "Explore all pages on Vanijay - products, categories, policies, and more.",
};

async function getCategories() {
    try {
        return await prisma.category.findMany({
            where: { isActive: true },
            select: { name: true, slug: true },
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        return [];
    }
}

export default async function SitemapPage() {
    const categories = await getCategories();

    const sections = [
        {
            title: "Main Pages",
            icon: <Home className="w-5 h-5" />,
            links: [
                { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
                { name: "About Us", href: "/about", icon: <Info className="w-4 h-4" /> },
                { name: "Contact Us", href: "/contact", icon: <Phone className="w-4 h-4" /> },
                { name: "Careers", href: "/careers", icon: <Briefcase className="w-4 h-4" /> },
                { name: "Blog", href: "/blog", icon: <BookOpen className="w-4 h-4" /> },
            ]
        },
        {
            title: "Support & Legal",
            icon: <ShieldCheck className="w-5 h-5" />,
            links: [
                { name: "Privacy Policy", href: "/privacy-policy", icon: <ShieldCheck className="w-4 h-4" /> },
                { name: "Cookie Policy", href: "/cookie-policy", icon: <ShieldCheck className="w-4 h-4" /> },
                { name: "Terms & Conditions", href: "/terms-conditions", icon: <FileText className="w-4 h-4" /> },
                { name: "Returns Policy", href: "/returns-policy", icon: <RefreshCcw className="w-4 h-4" /> },
                { name: "Shipping Policy", href: "/shipping-policy", icon: <Truck className="w-4 h-4" /> },
            ]
        },
        // {
        //     title: "Account",
        //     icon: <ShoppingBag className="w-5 h-5" />,
        //     links: [
        //         { name: "My Account", href: "/account", icon: <ShoppingBag className="w-4 h-4" /> },
        //         { name: "My Orders", href: "/account/orders", icon: <ShoppingBag className="w-4 h-4" /> },
        //         { name: "Cart", href: "/cart", icon: <ShoppingBag className="w-4 h-4" /> },
        //     ]
        // }
    ];

    return (
        <div className="bg-background min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-12 border-b pb-6">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <Map className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-foreground">Sitemap</h1>
                        <p className="text-muted-foreground mt-1">Navigate through all sections of Vanijay.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="flex items-center gap-2 text-primary">
                                {section.icon}
                                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                            </div>
                            <ul className="space-y-4 pl-7 border-l-2 border-primary/10 ml-2">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link
                                            href={link.href}
                                            className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <span className="p-1 rounded bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                {link.icon}
                                            </span>
                                            <span className="font-medium">{link.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {categories.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary">
                                <Layers className="w-5 h-5" />
                                <h2 className="text-xl font-bold text-foreground">Shop Categories</h2>
                            </div>
                            <div className="pl-7 border-l-2 border-primary/10 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                {categories.map((cat, cIdx) => (
                                    <Link
                                        key={cIdx}
                                        href={`/category/${cat.slug}`}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors py-1 flex items-center gap-2"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-16 p-8 bg-card border rounded-2xl text-center space-y-4">
                    <h3 className="text-lg font-bold">Need something else?</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        If you can't find what you're looking for, please visit our Help Center or contact our support team.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
