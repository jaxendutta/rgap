// src/lib/format.ts

export function formatCSV(items: string[] | null | undefined): string {
    if (!items || items.length === 0) return 'N/A';
    return items.join(', ');
}

export function formatSentenceCase(text: string | null | undefined): string {
    if (!text) return 'N/A';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// 🎯 FIXED: Timezone-safe date diff calculation
export function formatDateDiff(startDate: Date | string, endDate: Date | string): string {
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

    const yearPart = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
    const monthPart = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

    return [yearPart, monthPart].filter(part => part !== '').join(' ') || '0 months';
}

export function formatProvince(provinceCode: string | null): string {
    if (!provinceCode) return 'N/A';

    const provinces: Record<string, string> = {
        AB: 'Alberta',
        BC: 'British Columbia',
        MB: 'Manitoba',
        NB: 'New Brunswick',
        NL: 'Newfoundland and Labrador',
        NS: 'Nova Scotia',
        ON: 'Ontario',
        PE: 'Prince Edward Island',
        QC: 'Quebec',
        SK: 'Saskatchewan',
        NT: 'Northwest Territories',
        NU: 'Nunavut',
        YT: 'Yukon',
    };

    return provinces[provinceCode] || provinceCode;
}

export function formatRecipientType(type: string | null): string {
    if (!type) return 'N/A';
    return type === 'I' ? 'Institution' : 'Person';
}

export function formatOrganization(org: string | null): string {
    if (!org) return 'N/A';

    const orgs: Record<string, string> = {
        NSERC: 'Natural Sciences and Engineering Research Council',
        CIHR: 'Canadian Institutes of Health Research',
        SSHRC: 'Social Sciences and Humanities Research Council',
    };

    return orgs[org] || org;
}

// Re-export common utils so you can import everything from one place if needed
export { cn, formatCurrency, formatDate, formatNumber, truncate } from './utils';
