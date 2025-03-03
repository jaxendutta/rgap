export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
};

export const formatSentenceCase = (value: string): string => {
    return value
        .split(" ")
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
};

export const formatDateDiff = (date1: string, date2: string): string => {
    const diff = new Date(date2).getTime() - new Date(date1).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + " days";
};

export const formatShortCurrency = (value: number) => {
    if (value >= 1e6) {
        return `${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(1)}K`;
    } else {
        return value.toString();
    }
};
