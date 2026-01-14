"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LuMoveLeft, LuHouse, LuSearch, LuFileQuestion } from "react-icons/lu";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="h-full w-full flex items-center justify-center bg-gray-50/50 relative overflow-hidden">

            {/* 1. Background Decor: Subtle gradient blobs for depth */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl mix-blend-multiply animate-blob" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />

            {/* 2. Glass Card Container */}
            <div className="relative z-10 max-w-md w-full mx-4">
                <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 md:p-12 text-center ring-1 ring-gray-900/5">

                    {/* Icon */}
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-white shadow-inner mb-8 border border-white/50">
                        <LuFileQuestion className="h-10 w-10 text-gray-400" />
                    </div>

                    {/* Text Content */}
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">
                        Page not found
                    </h1>
                    <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                        Sorry, we couldn’t find the page you’re looking for. It might have been moved or doesn't exist.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => router.back()}
                            variant="secondary"
                            size="lg"
                            className="w-full sm:w-auto shadow-sm"
                        >
                            <LuMoveLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>

                        <Link href="/" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full shadow-lg shadow-gray-900/10">
                                <LuHouse className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>

                    {/* Optional: Search Link Footer */}
                    <div className="mt-10 pt-8 border-t border-gray-200/50">
                        <Link
                            href="/search"
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <LuSearch className="w-4 h-4 mr-2" />
                            Looking for a specific grant? Try searching
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
