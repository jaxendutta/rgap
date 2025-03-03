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
