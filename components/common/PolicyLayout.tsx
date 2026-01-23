import React from "react";

interface PolicyLayoutProps {
    title: string;
    children: React.ReactNode;
    lastUpdated?: string;
}

export const PolicyLayout = ({ title, children, lastUpdated }: PolicyLayoutProps) => {
    return (
        <div className="container-custom py-12 md:py-20 max-w-4xl mx-auto">
            <div className="mb-8 border-b pb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h1>
                {lastUpdated && (
                    <p className="text-muted-foreground text-sm italic">
                        Last Updated: {lastUpdated}
                    </p>
                )}
            </div>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground whitespace-pre-line">
                {children}
            </div>
        </div>
    );
};
