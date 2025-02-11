import { DEFAULT_FILTER_STATE } from '@/constants/filters'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: 'date' | 'value' | 'results'
  direction: SortDirection
}

export interface GrantSearchParams {
  searchTerms: {
    recipient: string
    institute: string
    grant: string
  }
  filters: typeof DEFAULT_FILTER_STATE
  sortConfig: SortConfig
}