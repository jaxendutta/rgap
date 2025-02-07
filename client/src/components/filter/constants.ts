// src/components/filter/constants.ts

export const FILTER_LIMITS = {
    GRANT_VALUE: {
      MIN: 0,
      MAX: 200_000_000, // $200M
      DEFAULT_STEP: 1000,
      QUICK_RANGES: [
        { label: 'Under $50k', min: 0, max: 50_000 },
        { label: '$50k - $200k', min: 50_000, max: 200_000 },
        { label: '$200k - $1M', min: 200_000, max: 1_000_000 },
        { label: 'Over $1M', min: 1_000_000, max: 200_000_000 },
      ]
    },
    YEAR: {
      MIN: 1900,
      MAX: new Date().getFullYear(),
      DEFAULT_STEP: 1,
      getQuickRanges: () => {
        const currentYear = new Date().getFullYear()
        return [
          { label: 'Last 5 years', min: currentYear - 4, max: currentYear },
          { label: 'Last 10 years', min: currentYear - 9, max: currentYear },
        ]
      }
    }
  } as const
  
  // Default filter state - can be used when initializing or resetting filters
  export const DEFAULT_FILTER_STATE = {
    yearRange: {
      start: '',
      end: ''
    },
    valueRange: {
      min: FILTER_LIMITS.GRANT_VALUE.MIN,
      max: FILTER_LIMITS.GRANT_VALUE.MAX
    },
    agencies: [] as string[],
    countries: [] as string[],
    provinces: [] as string[],
    cities: [] as string[]
  } as const
  
  // Type exports for the filter values
  // export type FilterValues = typeof DEFAULT_FILTER_STATE
  export interface FilterValues {
    yearRange: {
      start: string;
      end: string;
    };
    valueRange: {
      min: number;
      max: number;
    };
    agencies: string[];
    countries: string[];
    provinces: string[];
    cities: string[];
  }