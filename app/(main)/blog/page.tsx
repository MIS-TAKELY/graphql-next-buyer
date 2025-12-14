import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Blog | Dai E-Commerce",
    description: "Read the latest news, updates, and articles from Dai. Expert advice on [Product Category].",
    openGraph: {
        title: "Blog | Dai E-Commerce",
        description: "Read the latest news, updates, and articles from Dai.",
    },
};

const BLOG_POSTS = [
    {
        slug: "top-10-products-2025",
        title: "Top 10 Products to Buy in 2025",
        excerpt: "Discover the trending products that are taking the market by storm this year.",
        date: "2025-01-15",
    },
    {
        slug: "how-to-choose-best",
        title: "How to Choose the Best [Product]",
        excerpt: "A comprehensive guide to buying the perfect [Product] for your needs.",
        date: "2025-02-10",
    },
    {
        slug: "sustainable-shopping",
        title: "Why Sustainable Shopping Matters",
        excerpt: "Learn how your purchasing choices impact the environment and what you can do about it.",
        date: "2025-03-05",
    },
];

export default function BlogListingPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-4xl font-bold mb-8">Our Blog</h1>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {BLOG_POSTS.map((post) => (
                    <article key={post.slug} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="text-sm text-muted-foreground mb-2">{post.date}</div>
                            <h2 className="text-xl font-bold mb-3">
                                <Link href={`/blog/${post.slug}`} className="hover:underline">
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {post.excerpt}
                            </p>
                            <Link href={`/blog/${post.slug}`} className="text-primary font-medium hover:underline">
                                Read More →
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
