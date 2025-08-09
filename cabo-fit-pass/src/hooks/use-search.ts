'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { searchManager } from '@/lib/search'
import type { FitnessClass, Gym } from '@/types/database.types'

export interface SearchFilters {
  search: string
  category?: string
  difficulty?: string
  intensity?: string
  instructor?: string
  location?: string
  date?: Date
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  duration?: [number, number]
  credits?: [number, number]
  availability?: 'available' | 'waitlist' | 'all'
  sortBy?: 'time' | 'popularity' | 'credits' | 'rating' | 'distance'
  latitude?: number
  longitude?: number
  radius?: number // in kilometers
}

interface UseSearchOptions {
  debounceMs?: number
  autoSearch?: boolean
  enableLocation?: boolean
}

interface SearchResults {
  classes: FitnessClass[]
  studios: Gym[]
  totalCount: number
  hasMore: boolean
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 300, autoSearch = true, enableLocation = false } = options
  
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    duration: [30, 90],
    credits: [1, 4],
    availability: 'available',
    sortBy: 'time'
  })
  
  const [results, setResults] = useState<SearchResults>({
    classes: [],
    studios: [],
    totalCount: 0,
    hasMore: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      if (!autoSearch) return
      
      try {
        setLoading(true)
        setError(null)
        
        const searchResults = await searchManager.searchClasses(searchFilters)
        setResults(searchResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }, debounceMs),
    [autoSearch, debounceMs]
  )

  // Manual search function
  const search = useCallback(async (customFilters?: Partial<SearchFilters>) => {
    const searchFilters = { ...filters, ...customFilters }
    
    try {
      setLoading(true)
      setError(null)
      
      const searchResults = await searchManager.searchClasses(searchFilters)
      setResults(searchResults)
      
      return searchResults
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      duration: [30, 90],
      credits: [1, 4],
      availability: 'available',
      sortBy: 'time'
    })
  }, [])

  // Search for studios
  const searchStudios = useCallback(async (query: string, location?: { lat: number; lng: number }) => {
    try {
      const results = await searchManager.searchStudios(query, location)
      return results
    } catch (err) {
      console.error('Studio search error:', err)
      throw err
    }
  }, [])

  // Get popular searches
  const getPopularSearches = useCallback(async () => {
    try {
      return await searchManager.getPopularSearches()
    } catch (err) {
      console.error('Error getting popular searches:', err)
      return []
    }
  }, [])

  // Get search suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) return []
    
    try {
      return await searchManager.getSearchSuggestions(query)
    } catch (err) {
      console.error('Error getting suggestions:', err)
      return []
    }
  }, [])

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!enableLocation || !navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        updateFilters({ latitude: location.lat, longitude: location.lng })
      },
      (error) => {
        console.error('Error getting location:', error)
      }
    )
  }, [enableLocation, updateFilters])

  // Calculate distance between two points
  const calculateDistance = useCallback((
    lat1: number, 
    lng1: number, 
    lat2: number, 
    lng2: number
  ): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  // Filter results by distance if location is available
  const filteredResults = useMemo(() => {
    if (!userLocation || !filters.radius) return results

    const filteredClasses = results.classes.filter(cls => {
      if (!cls.gym?.latitude || !cls.gym?.longitude) return true
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        cls.gym.latitude,
        cls.gym.longitude
      )
      
      return distance <= filters.radius!
    })

    const filteredStudios = results.studios.filter(studio => {
      if (!studio.latitude || !studio.longitude) return true
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        studio.latitude,
        studio.longitude
      )
      
      return distance <= filters.radius!
    })

    return {
      ...results,
      classes: filteredClasses,
      studios: filteredStudios
    }
  }, [results, userLocation, filters.radius, calculateDistance])

  // Auto-search when filters change
  useEffect(() => {
    if (autoSearch && (filters.search || Object.keys(filters).length > 4)) {
      debouncedSearch(filters)
    }
  }, [filters, debouncedSearch, autoSearch])

  // Get user location on mount if enabled
  useEffect(() => {
    if (enableLocation) {
      getUserLocation()
    }
  }, [enableLocation, getUserLocation])

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.difficulty) count++
    if (filters.intensity) count++
    if (filters.instructor) count++
    if (filters.location) count++
    if (filters.date) count++
    if (filters.timeOfDay) count++
    if (filters.availability !== 'available') count++
    return count
  }, [filters])

  return {
    // State
    filters,
    results: filteredResults,
    loading,
    error,
    userLocation,
    
    // Actions
    search,
    updateFilters,
    clearFilters,
    searchStudios,
    
    // Utilities
    getSuggestions,
    getPopularSearches,
    getUserLocation,
    calculateDistance,
    
    // Computed values
    activeFiltersCount,
    hasResults: filteredResults.classes.length > 0 || filteredResults.studios.length > 0,
    isEmpty: !loading && filteredResults.classes.length === 0 && filteredResults.studios.length === 0,
  }
}

// Specialized hook for location-based search
export function useLocationSearch(radius = 10) {
  const {
    search,
    results,
    loading,
    userLocation,
    getUserLocation,
    calculateDistance
  } = useSearch({ enableLocation: true })

  const searchNearby = useCallback(async (filters: Partial<SearchFilters> = {}) => {
    if (!userLocation) {
      await new Promise<void>((resolve) => {
        getUserLocation()
        setTimeout(resolve, 1000) // Wait for location
      })
    }

    return search({
      ...filters,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
      radius,
      sortBy: 'distance'
    })
  }, [search, userLocation, getUserLocation, radius])

  const nearbyStudios = useMemo(() => {
    if (!userLocation) return []

    return results.studios
      .map(studio => ({
        ...studio,
        distance: studio.latitude && studio.longitude
          ? calculateDistance(userLocation.lat, userLocation.lng, studio.latitude, studio.longitude)
          : null
      }))
      .filter(studio => studio.distance !== null && studio.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }, [results.studios, userLocation, calculateDistance, radius])

  return {
    searchNearby,
    nearbyStudios,
    results,
    loading,
    userLocation,
    getUserLocation
  }
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}