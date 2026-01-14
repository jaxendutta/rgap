import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { LuLock, LuBookmark, LuGraduationCap, LuUniversity } from "react-icons/lu";

export default async function BookmarksPage() {
    const user = await getCurrentUser();

    // If user is logged in, show their actual content (or empty state)
    if (user) {
        return (
            <PageContainer>
                <PageHeader title="Bookmarks" subtitle="Manage your saved grants, recipients, and institutes." />
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <LuBookmark className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your collection is empty</h3>
                    <p className="text-gray-500 max-w-sm mt-2 mb-6">
                        Start exploring and save items to build your personal research collection.
                    </p>
                    <Link href="/search">
                        <Button>Explore Grants</Button>
                    </Link>
                </div>
            </PageContainer>
        );
    }

    // If NOT logged in: The "Modern Placeholder"
    return (
        <div className="relative h-full overflow-hidden bg-gray-50/50">

            {/* 1. BACKGROUND: Blurred 'Fake' Content to simulate restricted access */}
            <div className="absolute inset-0 p-6 md:p-8 opacity-40 blur-[6px] select-none pointer-events-none overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="h-10 w-48 bg-gray-300 rounded-lg mb-8" /> {/* Fake Title */}

                    {/* Fake Grid of Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 rounded-xl border border-gray-200 bg-white p-6 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100" />
                                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                                </div>
                                <div className="h-8 w-24 bg-gray-100 rounded-md self-end" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. FOREGROUND: The "Login Required" Glass Card */}
            <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-8 md:p-10 text-center ring-1 ring-gray-900/5">

                    {/* Animated/Styled Icon */}
                    <div className="mx-auto flex h-12 md:h-16 w-12 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white mb-4 md:mb-6 shadow-lg transform transition-transform hover:scale-105 duration-300">
                        <LuLock className="h-5 md:h-7 w-5 md:w-7" />
                    </div>

                    <h2 className="text-base md:text-2xl font-bold tracking-tight text-gray-900 mb-3">
                        Sign in to view bookmarks
                    </h2>

                    <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">
                        Your saved grants, researchers, and institutes are stored securely in your account. Log in to access your personal collection.
                    </p>

                    <div className="space-y-3">
                        <Link href="/login" className="block w-full">
                            <Button size="sm" className="w-full text-sm md:text-base shadow-md hover:shadow-lg transition-all">
                                Sign In to RGAP
                            </Button>
                        </Link>

                        <p className="text-xs text-gray-400 mt-2 md:mt-4">
                            Don't have an account? <Link href="/login" className="underline hover:text-gray-600">Create one for free!</Link>
                        </p>
                    </div>

                    {/* Feature Micro-list */}
                    <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-gray-200/60 grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <LuBookmark className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Grants</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                <LuGraduationCap className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Recipients</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <LuUniversity className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Institutes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
