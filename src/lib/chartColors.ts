// src/lib/chartColors.ts
export const AGENCY_COLORS: Record<string, string> = {
    NSERC: "#2563eb", // blue-600
    SSHRC: "#7c3aed", // violet-600
    CIHR: "#059669",  // emerald-600
    CFI: "#db2777",   // pink-600
    NARC: "#ea580c",  // orange-600
};

export const DEFAULT_CHART_COLORS: string[] = [
    "#2563eb", // Blue
    "#7c3aed", // Violet
    "#059669", // Emerald
    "#dc2626", // Red
    "#ea580c", // Orange
    "#0891b2", // Cyan
    "#4f46e5", // Indigo
    "#be185d", // Pink
    "#84cc16", // Lime
    "#d946ef", // Fuchsia
    "#f59e0b", // Amber
    "#06b6d4", // Sky
    "#8b5cf6", // Purple
    "#10b981", // Teal
    "#f43f5e", // Rose
    "#6366f1", // Iris
    "#14b8a6", // Teal
    "#9333ea", // Purple
    "#c026d3", // Fuchsia
    "#e11d48", // Rose
];

export const AMENDMENT_COLORS: Record<string, string> = {
    Original: "#3b82f6",
    Amendment: "#f59e0b",
    Final: "#10b981"
};

export const getCategoryColor = (category: string, index: number): string => {
    if (AGENCY_COLORS[category]) return AGENCY_COLORS[category];
    return DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
};
