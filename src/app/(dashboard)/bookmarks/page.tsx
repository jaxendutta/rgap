// src/app/(dashboard)/bookmarks/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getUserBookmarks } from "@/app/actions/bookmarks";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import BookmarksClient from "@/app/(dashboard)/bookmarks/client";
import { LuBookmark, LuLock } from "react-icons/lu";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BookmarksPage(props: Props) {
    const searchParams = await props.searchParams;
    const user = await getCurrentUser();

    if (!user) {
        // Not Logged In State
        return (
            <div className="relative h-full overflow-hidden bg-gray-50/50 min-h-screen">
                <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-8 md:p-10 text-center ring-1 ring-gray-900/5">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white mb-6 shadow-lg">
                            <LuLock className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
                            Sign in to view bookmarks
                        </h2>
                        <p className="text-gray-500 mb-8">
                            Your saved grants, researchers, and institutes are stored securely in your account.
                        </p>
                        <Link href="/login" className="block w-full">
                            <Button size="lg" className="w-full shadow-md hover:shadow-lg transition-all">
                                Sign In to RGAP
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Extract sort parameters
    const sortField = typeof searchParams.sort === 'string' ? searchParams.sort : undefined;
    const sortDir = searchParams.dir === 'asc' ? 'asc' : 'desc';

    const data = await getUserBookmarks({ field: sortField, direction: sortDir });

    // Handle potential error or null data
    if (!data) {
        return (
            <PageContainer>
                <PageHeader title="Bookmarks" subtitle="Manage your saved research collection." />
                <div className="p-4 text-red-600 bg-red-50 rounded-lg">
                    Error loading bookmarks. Please try again later.
                </div>
            </PageContainer>
        );
    }

    const { grants, recipients, institutes, searches } = data;
    const isEmpty = grants.length === 0 && recipients.length === 0 && institutes.length === 0 && searches.length === 0;

    if (isEmpty) {
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
                    <Link href="/search"><Button>Explore Grants</Button></Link>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader title="Bookmarks" subtitle="Manage your saved research collection." />
            <BookmarksClient
                grants={grants}
                recipients={recipients}
                institutes={institutes}
                searches={searches}
            />
        </PageContainer>
    );
}
