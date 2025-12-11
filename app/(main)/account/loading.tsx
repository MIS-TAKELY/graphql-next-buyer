import { Card, CardContent } from "@/components/ui/card";

export default function AccountLoading() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Skeleton */}
                    <aside className="w-full lg:w-64 space-y-2">
                        <div className="h-10 bg-secondary/20 rounded animate-pulse" />
                        <div className="h-10 bg-secondary/15 rounded animate-pulse" />
                        <div className="h-10 bg-secondary/15 rounded animate-pulse" />
                        <div className="h-10 bg-secondary/15 rounded animate-pulse" />
                        <div className="h-10 bg-secondary/15 rounded animate-pulse" />
                    </aside>

                    {/* Main Content Skeleton */}
                    <main className="flex-1 space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-secondary/20 rounded animate-pulse" />
                            <div className="h-4 w-64 bg-secondary/15 rounded animate-pulse" />
                        </div>

                        {/* Profile Card Skeleton */}
                        <Card className="border-border/50">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-secondary/20 animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-6 w-48 bg-secondary/20 rounded animate-pulse" />
                                        <div className="h-4 w-64 bg-secondary/15 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="h-4 w-24 bg-secondary/15 rounded animate-pulse" />
                                            <div className="h-10 bg-secondary/10 rounded animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Addresses Section Skeleton */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="h-7 w-40 bg-secondary/20 rounded animate-pulse" />
                                <div className="h-10 w-32 bg-primary/20 rounded animate-pulse" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(2)].map((_, i) => (
                                    <Card key={i} className="border-border/50">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="h-5 w-24 bg-secondary/20 rounded animate-pulse" />
                                                <div className="h-8 w-8 bg-secondary/15 rounded animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 w-full bg-secondary/15 rounded animate-pulse" />
                                                <div className="h-4 w-4/5 bg-secondary/15 rounded animate-pulse" />
                                                <div className="h-4 w-3/5 bg-secondary/15 rounded animate-pulse" />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <div className="h-9 flex-1 bg-secondary/15 rounded animate-pulse" />
                                                <div className="h-9 flex-1 bg-secondary/15 rounded animate-pulse" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Orders Section Skeleton */}
                        <div className="space-y-4">
                            <div className="h-7 w-40 bg-secondary/20 rounded animate-pulse" />

                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i} className="border-border/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="h-20 w-20 bg-secondary/20 rounded animate-pulse flex-shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-5 w-3/4 bg-secondary/20 rounded animate-pulse" />
                                                    <div className="h-4 w-1/2 bg-secondary/15 rounded animate-pulse" />
                                                    <div className="h-4 w-32 bg-secondary/15 rounded animate-pulse" />
                                                </div>
                                                <div className="h-9 w-24 bg-primary/20 rounded animate-pulse" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
