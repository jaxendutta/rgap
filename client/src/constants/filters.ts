// src/constants/filters.ts
export const FILTER_LIMITS = {
    DATE_VALUE: {
        MIN: new Date(1990, 0, 1),
        MAX: new Date(),
    },
    
    GRANT_VALUE: {
        MIN: 0,
        MAX: 200_000_000,
        DEFAULT_STEP: 1000,
    },
};

export const DEFAULT_FILTER_STATE = {
    dateRange: { 
        from: FILTER_LIMITS.DATE_VALUE.MIN,
        to: FILTER_LIMITS.DATE_VALUE.MAX,
    },
    valueRange: {
        min: FILTER_LIMITS.GRANT_VALUE.MIN,
        max: FILTER_LIMITS.GRANT_VALUE.MAX,
    },
    agencies: [] as string[],
    countries: [] as string[],
    provinces: [] as string[],
    cities: [] as string[],
};

export type FilterKey = keyof typeof DEFAULT_FILTER_STATE;
