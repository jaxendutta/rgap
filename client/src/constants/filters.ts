export const FILTER_LIMITS = {
    GRANT_VALUE: {
        MIN: 0,
        MAX: 200_000_000,
        DEFAULT_STEP: 1000,
    },
    YEAR: {
        MIN: 1990,
        MAX: new Date().getFullYear(),
        DEFAULT_STEP: 1,
    },
};

export const FILTER_OPTIONS = {
    AGENCIES: ['NSERC', 'SSHRC', 'CIHR'],
    COUNTRIES: ['Canada', 'United States', 'United Kingdom', 'France'],
    PROVINCES: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
    CITIES: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa'],
};

export const DEFAULT_FILTER_STATE = {
    yearRange: { start: FILTER_LIMITS.YEAR.MIN, end: FILTER_LIMITS.YEAR.MAX },
    valueRange: { min: FILTER_LIMITS.GRANT_VALUE.MIN, max: FILTER_LIMITS.GRANT_VALUE.MAX },
    agencies: [] as string[],
    countries: [] as string[],
    provinces: [] as string[],
    cities: [] as string[]
};

export type FilterKey = keyof typeof DEFAULT_FILTER_STATE;