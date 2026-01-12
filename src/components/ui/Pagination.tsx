// src/components/ui/Pagination.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from './Button';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface PaginationProps {
    totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link href={createPageURL(currentPage - 1)}>
                    <Button variant="outline">
                        <LuChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                </Link>
            ) : (
                <Button variant="outline" disabled>
                    <LuChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
            )}

            <div className="flex items-center text-sm font-medium">
                Page {currentPage} of {totalPages}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link href={createPageURL(currentPage + 1)}>
                    <Button variant="outline">
                        Next
                        <LuChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
            ) : (
                <Button variant="outline" disabled>
                    Next
                    <LuChevronRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}