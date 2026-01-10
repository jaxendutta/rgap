import { clsx, type ClassValue } from 'clsx';
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

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
export function getSortOptions(entityType: 'grant' | 'recipient' | 'institute') {
  const baseOptions = [
    { field: 'date', label: 'Date' },
    { field: 'value', label: 'Funding Value' },
    { field: 'name', label: 'Name' },
  ];

  if (entityType === 'grant') {
    return [
      { field: 'agreement_start_date', label: 'Start Date' },
      { field: 'agreement_value', label: 'Funding Value' },
      { field: 'agreement_title_en', label: 'Title' },
    ];
  }

  if (entityType === 'recipient') {
    return [
      { field: 'legal_name', label: 'Name' },
      { field: 'total_funding', label: 'Total Funding' },
      { field: 'grant_count', label: 'Number of Grants' },
    ];
  }

  if (entityType === 'institute') {
    return [
      { field: 'name', label: 'Name' },
      { field: 'total_funding', label: 'Total Funding' },
      { field: 'grant_count', label: 'Number of Grants' },
    ];
  }

  return baseOptions;
}