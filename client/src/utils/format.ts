// src/utils/format.ts
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatDate = (date: Date | string): string => {
    if (!date) return "N/A";
    try {
        if (typeof date === "string") {
            date = new Date(date);
        }
        return new Date(date).toLocaleDateString();
    } catch (e) {
        return "Invalid Date";
    }
};

export const formatDateDiff = (startDate: string, endDate: string): string => {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Calculate difference in milliseconds
        const diffTime = Math.abs(end.getTime() - start.getTime());

        // Calculate difference in days
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate months and years
        const diffMonths =
            (end.getFullYear() - start.getFullYear()) * 12 +
            end.getMonth() -
            start.getMonth();
        const years = Math.floor(diffMonths / 12);
        const months = diffMonths % 12;

        if (years > 0 && months > 0) {
            return `${years} ${years === 1 ? "year" : "years"} and ${months} ${
                months === 1 ? "month" : "months"
            }`;
        } else if (years > 0) {
            return `${years} ${years === 1 ? "year" : "years"}`;
        } else if (months > 0) {
            return `${months} ${months === 1 ? "month" : "months"}`;
        } else if (diffDays > 0) {
            return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
        } else {
            return "Same date";
        }
    } catch (e) {
        return "N/A";
    }
};

export const formatSentenceCase = (value: string): string => {
    if (!value) return "";
    return value
        .split(" ")
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
};
