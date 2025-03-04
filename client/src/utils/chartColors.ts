// src/utils/chartColors.ts
export const AGENCY_COLORS: Record<string, string> = {
    NSERC: "#2563eb", // blue
    SSHRC: "#7c3aed", // purple
    CIHR: "#059669", // green
};

export const DEFAULT_CHART_COLORS = [
    "#2563eb", // blue
    "#7c3aed", // purple
    "#059669", // green
    "#dc2626", // red
    "#ea580c", // orange
    "#0891b2", // cyan
    "#4f46e5", // indigo
    "#be185d", // pink
];

export const getCategoryColor = (category: string, index: number): string => {
    return (
        AGENCY_COLORS[category] ||
        DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]
    );
};
