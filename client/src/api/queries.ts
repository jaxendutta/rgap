import { useQuery } from "@tanstack/react-query"
import axios from 'axios'
import { FilterValues } from '../components/filter/constants'
import { ResearchGrant } from '../components/types/types'

const API = axios.create({ baseURL: 'http://localhost:3030' })

// Types for the search response
interface SearchResponse {
  data: ResearchGrant[]
  message: string
}

// Interface for search parameters
interface SearchParams {
  searchTerms: {
    recipient: string
    institute: string
    grant: string
  }
  filters: FilterValues
  sortConfig: {
    field: string
    direction: 'asc' | 'desc'
  }
}

// Helper to handle null values in responses
const replaceNulls = (obj: any): any => {
  if (obj === null) return "null"
  if (Array.isArray(obj)) return obj.map(replaceNulls)
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, replaceNulls(value)])
    )
  }
  return obj
}

// Transform frontend filters to match backend expectations
const transformFilters = (filters: FilterValues) => {
  return {
    year: filters.yearRange?.start || '',
    agency: filters.agencies?.[0] || '', // Taking first selected agency for now
    minvalue: filters.valueRange?.min || '',
    maxvalue: filters.valueRange?.max || '',
    country: filters.countries?.[0] || '',
    province: filters.provinces?.[0] || '',
    city: filters.cities?.[0] || ''
  }
}

// Get all grants
export const useGetAllGrants = () => {
  return useQuery<ResearchGrant[]>({
    queryKey: ["AllGrants"],
    queryFn: async () => {
      const response = await API.get<ResearchGrant[]>('/search/all')
      return replaceNulls(response.data)
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

// Search grants with parameters
export const useGrantSearch = (
  searchParams: SearchParams, 
  options?: { enabled?: boolean }
) => {
  return useQuery<ResearchGrant[]>({
    queryKey: ["SearchGrants", searchParams],
    queryFn: async () => {
      // Check if this should be a "get all" query
      const isEmptySearch = Object.values(searchParams.searchTerms).every(v => v === '') &&
        Object.values(searchParams.filters).every(v => 
          Array.isArray(v) ? v.length === 0 : 
          typeof v === 'object' && v !== null ? Object.values(v).every(val => !val) : !v
        )

      if (isEmptySearch) {
        const response = await API.get<ResearchGrant[]>('/search/all')
        return replaceNulls(response.data)
      }

      // Transform filters to match backend expectations
      const transformedFilters = transformFilters(searchParams.filters)

      const response = await API.post<SearchResponse>('/search', {
        searchTerms: searchParams.searchTerms,
        filters: transformedFilters,
        sortConfig: searchParams.sortConfig
      })

      return replaceNulls(response.data.data)
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: options?.enabled ?? true,
  })
}

// Additional specific queries
export const useRecipientSearch = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['recipients', searchTerm],
    queryFn: async () => {
      const response = await API.get('/recipients', {
        params: { search: searchTerm }
      })
      return replaceNulls(response.data)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useInstituteSearch = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['institutes', searchTerm],
    queryFn: async () => {
      const response = await API.get('/institutes', {
        params: { search: searchTerm }
      })
      return replaceNulls(response.data)
    },
    staleTime: 1000 * 60 * 5,
  })
}