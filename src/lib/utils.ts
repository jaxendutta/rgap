// src/lib/utils.ts

import { GrantWithDetails, InstituteWithStats, RecipientWithStats, SortOption } from '@/types/database';
import { clsx, type ClassValue } from 'clsx';
import { LuCalendar, LuDollarSign, LuHash, LuUsers } from 'react-icons/lu';
import { MdSortByAlpha } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// Format number with commas
export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-CA').format(value);
}

// Format date
export function formatDate(date: Date | string | null | undefined, format: 'short' | 'long' = 'short'): string {
    if (!date) return 'N/A';

    let dateObj: Date;

    // Handle string dates (from database: "YYYY-MM-DD")
    if (typeof date === 'string') {
        // For ISO date strings (YYYY-MM-DD), parse manually to avoid timezone issues
        const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            // Create date at noon UTC to avoid any timezone edge cases
            dateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
        } else {
            // For other date string formats, try standard parsing
            dateObj = new Date(date);
        }
    } else {
        dateObj = date;
    }

    // Check for invalid date
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    // Format with UTC timezone to ensure consistency across server and client
    if (format === 'long') {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
        }).format(dateObj);
    }

    return new Intl.DateTimeFormat('en-CA', {
        dateStyle: 'short',
        timeZone: 'UTC',
    }).format(dateObj);
}

// Truncate text
export function truncate(text: string | null | undefined, length: number = 100): string {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse query params
export function parseQueryParams(searchParams: URLSearchParams) {
    const params: Record<string, any> = {};

    searchParams.forEach((value, key) => {
        // Handle array values (e.g., ?org=NSERC&org=CIHR)
        if (params[key]) {
            if (Array.isArray(params[key])) {
                params[key].push(value);
            } else {
                params[key] = [params[key], value];
            }
        } else {
            params[key] = value;
        }
    });

    return params;
}

// Generate pagination metadata
export function generatePagination(page: number, pageSize: number, totalCount: number) {
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}

// Calculate offset for pagination
export function calculateOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
}

// Sort options helper
export function getSortOptions(entityType: 'grant' | 'recipient' | 'institute', context: "recipient" | "institute" | "grant") {
    switch (entityType) {
        case 'grant':
            let grantSortOptions: SortOption[] = [
                {
                    value: 'agreement_start_date',
                    label: 'Date',
                    field: 'agreement_start_date',
                    direction: 'desc',
                    icon: LuCalendar
                },
                {
                    value: 'agreement_value',
                    label: 'Value',
                    field: 'agreement_value',
                    direction: 'desc',
                    icon: LuDollarSign
                },
            ];
            if (context === 'grant' || context === 'institute') {
                grantSortOptions.push({
                    value: 'recipient',
                    label: 'Recipient',
                    field: 'legal_name',
                    direction: 'asc',
                    icon: MdSortByAlpha,
                });
            }
            return grantSortOptions;

        case 'recipient':
            let recipientSortOptions: SortOption[] = [
                {
                    value: 'grant_count',
                    label: 'Grants',
                    field: 'grant_count',
                    direction: 'desc',
                    icon: LuHash,
                },
                {
                    value: 'total_funding',
                    label: 'Funding',
                    field: 'total_funding',
                    direction: 'desc',
                    icon: LuDollarSign,
                },
            ];
            if (context !== 'grant') {
                recipientSortOptions.push({
                    value: 'legal_name',
                    label: 'Recipient',
                    field: 'legal_name',
                    direction: 'asc',
                    icon: MdSortByAlpha,
                });
            }
            return recipientSortOptions;

        case 'institute':
            let instituteSortOptions: SortOption[] = [
                {
                    value: 'grant_count',
                    label: 'Grants',
                    field: 'grant_count',
                    direction: 'desc',
                    icon: LuHash,
                },
                {
                    value: 'total_funding',
                    label: 'Funding',
                    field: 'total_funding',
                    direction: 'desc',
                    icon: LuDollarSign,
                },
            ];
            if (context === 'institute') {
                instituteSortOptions.push(
                    {
                        value: 'recipient_count',
                        label: 'Recipients',
                        field: 'recipient_count',
                        direction: 'desc',
                        icon: LuUsers,
                    },
                    {
                        value: 'name',
                        label: 'Institute',
                        field: 'name',
                        direction: 'asc',
                        icon: MdSortByAlpha,
                    },
                );
            }
            return instituteSortOptions;
    }
}
