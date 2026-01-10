// src/constants/filters.ts
// Static filter options used across the app

// Default filter state
export const DEFAULT_FILTER_STATE: {
  query: string;
  organizations: string[];
  programs: number[];
  institutes: number[];
  recipients: number[];
  startDate: string | undefined;
  endDate: string | undefined;
  minValue: number | undefined;
  maxValue: number | undefined;
  provinces: string[];
  cities: string[];
  recipientType: string | undefined;
} = {
  query: '',
  organizations: [],
  programs: [],
  institutes: [],
  recipients: [],
  startDate: undefined,
  endDate: undefined,
  minValue: undefined,
  maxValue: undefined,
  provinces: [],
  cities: [],
  recipientType: undefined,
};

export const ORGANIZATION_OPTIONS = [
    { value: 'NSERC', label: 'NSERC' },
    { value: 'CIHR', label: 'CIHR' },
    { value: 'SSHRC', label: 'SSHRC' },
];

export const RECIPIENT_TYPE_OPTIONS = [
    { value: 'I', label: 'Institution' },
    { value: 'P', label: 'Person' },
];

export const PROVINCE_OPTIONS = [
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
];

export const SORT_OPTIONS = [
    { value: 'date-desc', label: 'Date (Newest First)' },
    { value: 'date-asc', label: 'Date (Oldest First)' },
    { value: 'value-desc', label: 'Value (Highest First)' },
    { value: 'value-asc', label: 'Value (Lowest First)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
];