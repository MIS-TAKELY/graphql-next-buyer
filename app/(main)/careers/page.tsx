import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.vanijay.com';

export const metadata: Metadata = {
    title: "Careers - Vanijay | Join our Team",
    description: "Explore career opportunities at Vanijay. Join our mission to revolutionize e-commerce in Nepal.",
    alternates: {
        canonical: `${baseUrl}/careers`,
    }
};

export default function CareersPage() {
    return (
        <div className="bg-background min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Briefcase className="w-12 h-12 text-primary" />
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-primary">Careers at Vanijay</h1>
                    <p className="mt-4 text-xl text-muted-foreground">
                        Building the future of commerce in Nepal.
                    </p>
                </div>

                <div className="bg-card p-8 rounded-xl shadow-sm border space-y-4">
                    <h2 className="text-2xl font-bold text-foreground italic">No Vacancy</h2>
                    <p className="text-muted-foreground">
                        Thank you for your interest in joining Vanijay. Currently, we do not have any open positions.
                        Please check back later or follow our social media channels for updates on future opportunities.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/"
                        className="text-primary hover:underline font-medium transition-colors"
                    >
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
