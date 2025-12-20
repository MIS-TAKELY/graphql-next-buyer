import { ShoppingBag } from "lucide-react";

export default function GlobalLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-orange-500" />
            </div>
            <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Just a moment
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    We're getting things ready for you...
                </p>
            </div>
        </div>
    );
}
