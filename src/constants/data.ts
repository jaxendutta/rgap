// src/constants/data.ts
// Static data used for display

export const ORG_COLORS: Record<string, string> = {
    NSERC: '#0066CC',
    CIHR: '#DC3545',
    SSHRC: '#28A745',
};

export const ORG_NAMES: Record<string, string> = {
    NSERC: 'Natural Sciences and Engineering Research Council',
    CIHR: 'Canadian Institutes of Health Research',
    SSHRC: 'Social Sciences and Humanities Research Council',
};

export const RECIPIENT_TYPE_LABELS: Record<string, string> = {
    I: 'Institution',
    P: 'Person',
};

export const DEFAULT_ITEM_PER_PAGE = 30;
export const MAX_NOTE_LENGTH = 2000;
export const LAST_UPDATED: Date = new Date('2026-01-24T00:00:00Z');
