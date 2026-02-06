import { Metadata } from 'next';
import { APP_URL } from "@/config/env";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const url = `${APP_URL}/blog/${slug}`;
    return {
        title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Blog | Vanijay`,
        description: `Read our article about ${slug.replace(/-/g, ' ')}. Expert insights and tips.`,
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: "article",
            url,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Article Schema
    const articleLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "image": [`${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/blog/${slug}/image.jpg`],
        "datePublished": "2025-01-01T08:00:00+08:00",
        "dateModified": "2025-01-01T09:20:00+08:00",
        "author": {
            "@type": "Person",
            "name": "Vanijay Editorial Team",
            "url": `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/about`
        }
    };

    return (
        <div className="container-custom py-12 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            <article className="prose dark:prose-invert lg:prose-xl mx-auto">
                <h1>{title}</h1>
                <p className="lead">
                    This is a detailed article about {title}. In this post, we will explore the key aspects of the topic along with expert recommendations.
                </p>
                <hr />
                <h2>Introduction</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <h2>Key Takeaways</h2>
                <ul>
                    <li>Insight 1 about {slug}</li>
                    <li>Insight 2 about optimized content</li>
                    <li>Insight 3 about engagement</li>
                </ul>
                <h2>Conclusion</h2>
                <p>
                    We hope this guide helped you understand more about {title}. Stay tuned for more updates.
                </p>
            </article>
        </div>
    );
}
