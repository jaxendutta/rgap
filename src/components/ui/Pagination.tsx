// src/components/ui/Pagination.tsx
'use client';

import { useTransition } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from 'react-icons/lu';
import { DEFAULT_ITEM_PER_PAGE } from '@/constants/data';

export interface PaginationProps {
    totalCount: number;
    pageSize?: number;
    currentPage?: number;
    paramName?: string;
    onPageChange?: (page: number) => void;
    // Set by a parent that already wraps its own onPageChange in a
    // transition (e.g. EntityList), so this component's controls reflect
    // that pending state instead of only its own internal fallback.
    isPending?: boolean;
}

export function Pagination({
    totalCount,
    pageSize = DEFAULT_ITEM_PER_PAGE,
    currentPage: propCurrentPage,
    paramName = 'page',
    onPageChange,
    isPending: externalIsPending = false,
}: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [internalIsPending, startTransition] = useTransition();
    const isPending = externalIsPending || internalIsPending;

    const currentPage = propCurrentPage ?? Number(searchParams.get(paramName)) ?? 1;
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set(paramName, page.toString());

            // Force a scroll to top for better UX on page change
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: true });
            });
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <Button
                variant="outline"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || isPending}
                className="gap-1 p-2 md:pl-2.5 bg-white"
            >
                <LuChevronsLeft className="size-4" />
            </Button>

            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
                className="gap-1 p-2 md:pl-2.5 bg-white"
            >
                <LuChevronLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-2 text-xs md:text-sm font-medium mx-2">
                {isPending && (
                    <div className="size-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
                Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
            </div>

            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isPending}
                className="gap-1 p-2 md:pr-2.5 bg-white"
            >
                <LuChevronRight className="size-4" />
            </Button>

            <Button
                variant="outline"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages || isPending}
                className="gap-1 p-2 md:r-2.5 bg-white"
            >
                <LuChevronsRight className="size-4" />
            </Button>
        </div>
    );
}

export default Pagination;
