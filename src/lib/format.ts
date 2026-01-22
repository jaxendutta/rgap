// src/lib/format.ts

export function formatCSV(items: string[] | null | undefined): string {
    if (!items || items.length === 0) return 'N/A';
    return items.join(', ');
}

export function formatSentenceCase(text: string | null | undefined): string {
    if (!text) return 'N/A';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Timezone-safe date diff calculation
export function formatDateDiff(startDate: Date | string, endDate: Date | string, style: 'long' | 'short' = 'long'): string {
    // Parse dates safely
    const parseDate = (date: Date | string): Date => {
        if (typeof date === 'string') {
            const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const [, year, month, day] = match;
                return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0));
            }
            return new Date(date);
        }
        return date;
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    let years = end.getUTCFullYear() - start.getUTCFullYear();
    let months = end.getUTCMonth() - start.getUTCMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    if (style === 'short') {
        return `${years}yrs ${months}mos`;
    } else {
        const yearPart = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
        const monthPart = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

        return [yearPart, monthPart].filter(part => part !== '').join(' ') || '0 months';
    }
}

// Re-export common utils so you can import everything from one place if needed
export { cn, formatCurrency, formatDate, formatNumber, truncate } from './utils';
