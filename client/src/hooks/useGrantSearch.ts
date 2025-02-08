import { useQuery } from "@tanstack/react-query"
import axios from 'axios'
import { FilterValues } from '../components/filter/constants'

const API = axios.create({ baseURL: 'http://localhost:3030' })

// Types for search parameters that match SearchPage
interface SearchTerms {
  recipient: string
  institute: string
  grant: string
}

interface SortConfig {
  field: 'date' | 'value'
  direction: 'asc' | 'desc'
}

interface SearchParams {
  searchTerms: SearchTerms
  filters: FilterValues
  sortConfig: SortConfig
}

// Interface for search results
export interface SearchResult {
  ref_number: string
  recipient_id: number
  recipient: string
  institute: string
  grant: string
  value: number
  agency: string
  startDate: string
  endDate: string
  city: string
  province: string
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

// Add this after your other interfaces
interface BackendSearchRequest {
    searchTerms: {
      recipient: string
      institute: string
      grant: string
    }
    filters: {
      year?: string
      agency?: string
      minvalue?: string | number
      maxvalue?: string | number
      country?: string
      province?: string
      city?: string
    }
    sortConfig: {
      field: 'date' | 'value'
      direction: 'asc' | 'desc'
    }
  }
  
  // Update transformFilters to ensure correct types
  const transformFilters = (filters: FilterValues): BackendSearchRequest['filters'] => {
    return {
      year: filters.yearRange?.start || '',
      agency: filters.agencies?.[0] || '',
      minvalue: filters.valueRange?.min || '',
      maxvalue: filters.valueRange?.max || '',
      country: filters.countries?.[0] || '',
      province: filters.provinces?.[0] || '',
      city: filters.cities?.[0] || ''
    }
}

export function useGrantSearch(
    searchParams: SearchParams, 
    options?: { enabled?: boolean }
  ) {
    return useQuery<SearchResult[]>({
      queryKey: ["SearchGrants", searchParams],
      queryFn: async () => {
        try {
          const isEmptySearch = Object.values(searchParams.searchTerms).every(v => v === '') &&
            Object.values(searchParams.filters).every(v => 
              Array.isArray(v) ? v.length === 0 : 
              typeof v === 'object' && v !== null ? Object.values(v).every(val => !val) : !v
            )
  
          const endpoint = isEmptySearch ? '/search/all' : '/search'
          console.log(`Making ${isEmptySearch ? 'GET' : 'POST'} request to: ${endpoint}`)
  
          if (isEmptySearch) {
            const response = await API.get<SearchResult[]>(endpoint, {
              timeout: 150000 // Increase timeout to 15 seconds
            })
            return replaceNulls(response.data)
          }
  
          const transformedFilters = transformFilters(searchParams.filters)
          const payload = {
            searchTerms: searchParams.searchTerms,
            filters: transformedFilters,
            sortConfig: searchParams.sortConfig
          }
          
          console.log('Search request payload:', payload)
  
          const response = await API.post<{ data: SearchResult[] }>(endpoint, payload, {
            timeout: 5000, // 5 seconds
            headers: {
              'Content-Type': 'application/json'
            }
          })
  
          if (!response.data) {
            throw new Error('No data received from server')
          }
  
          return replaceNulls(response.data.data || [])
        } catch (error) {
          if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            throw new Error('Server is not responding. Please try again later.')
          }
          throw error
        }
      },
      staleTime: 1000 * 60 * 5,
      enabled: false,
      retry: 1,
    })
  }

// Additional specific queries with proper typing
export function useRecipientSearch(searchTerm?: string) {
  return useQuery<SearchResult[]>({
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

export function useInstituteSearch(searchTerm?: string) {
  return useQuery<SearchResult[]>({
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