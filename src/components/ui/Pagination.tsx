// src/components/ui/Pagination.tsx
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from 'react-icons/lu';

export interface PaginationProps {
    totalPages: number;
    currentPage?: number;
    paramName?: string;
    onPageChange?: (page: number) => void;
}

export function Pagination({
    totalPages,
    currentPage: propCurrentPage,
    paramName = 'page',
    onPageChange
}: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Use prop if provided, otherwise fall back to URL param
    const currentPage = propCurrentPage || Number(searchParams.get(paramName)) || 1;

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set(paramName, page.toString());
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <Button
                variant="outline"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="gap-1 pl-2.5"
            >
                <LuChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="gap-1 pl-2.5"
            >
                <LuChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center text-sm font-medium mx-2">
                Page {currentPage} of {totalPages}
            </div>

            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="gap-1 pr-2.5"
            >
                <LuChevronRight className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="gap-1 pr-2.5"
            >
                <LuChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
