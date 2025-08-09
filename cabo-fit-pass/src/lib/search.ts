import { createClient } from '@supabase/supabase-js'
import type { Database, FitnessClass, Gym } from '@/types/database.types'

interface SearchFilters {
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
  radius?: number
  limit?: number
  offset?: number
}

interface SearchResults {
  classes: FitnessClass[]
  studios: Gym[]
  totalCount: number
  hasMore: boolean
}

interface SearchSuggestion {
  type: 'class' | 'instructor' | 'category' | 'studio'
  value: string
  count?: number
}

export class SearchManager {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Main search function for classes
  async searchClasses(filters: SearchFilters): Promise<SearchResults> {
    const {
      search = '',
      category,
      difficulty,
      intensity,
      instructor,
      location,
      date,
      timeOfDay,
      duration,
      credits,
      availability = 'available',
      sortBy = 'time',
      latitude,
      longitude,
      radius,
      limit = 50,
      offset = 0
    } = filters

    let query = this.supabase
      .from('fitness_classes')
      .select(`
        *,
        gym:gyms(*),
        bookings(id, status)
      `)
      .eq('status', 'scheduled')

    // Text search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,instructor_name.ilike.%${search}%`)
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    // Intensity filter
    if (intensity && intensity !== 'all') {
      query = query.eq('intensity', intensity)
    }

    // Instructor filter
    if (instructor && instructor !== 'all') {
      query = query.ilike('instructor_name', `%${instructor}%`)
    }

    // Date filter
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query.gte('start_time', startOfDay.toISOString())
                   .lte('start_time', endOfDay.toISOString())
    } else {
      // Only future classes
      query = query.gte('start_time', new Date().toISOString())
    }

    // Time of day filter
    if (timeOfDay) {
      const timeRanges = {
        morning: { start: 5, end: 12 },
        afternoon: { start: 12, end: 17 },
        evening: { start: 17, end: 23 }
      }
      
      const range = timeRanges[timeOfDay]
      // This is a simplified version - in practice, you'd need a more complex query
      // or handle this filtering in the application layer
    }

    // Duration filter
    if (duration) {
      query = query.gte('duration', duration[0]).lte('duration', duration[1])
    }

    // Credits filter
    if (credits) {
      query = query.gte('credits_required', credits[0]).lte('credits_required', credits[1])
    }

    // Location filter (if searching by area name)
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Sorting
    switch (sortBy) {
      case 'time':
        query = query.order('start_time', { ascending: true })
        break
      case 'popularity':
        query = query.order('current_participants', { ascending: false })
        break
      case 'credits':
        query = query.order('credits_required', { ascending: true })
        break
      case 'rating':
        query = query.order('average_rating', { ascending: false, nullsLast: true })
        break
      default:
        query = query.order('start_time', { ascending: true })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: rawClasses, error, count } = await query

    if (error) throw error

    let classes = rawClasses || []

    // Post-processing filters that are complex to do in SQL
    if (timeOfDay) {
      classes = classes.filter(cls => {
        const hour = new Date(cls.start_time).getHours()
        switch (timeOfDay) {
          case 'morning': return hour >= 5 && hour < 12
          case 'afternoon': return hour >= 12 && hour < 17
          case 'evening': return hour >= 17 && hour <= 23
          default: return true
        }
      })
    }

    // Filter by availability
    if (availability !== 'all') {
      classes = classes.filter(cls => {
        const confirmedBookings = cls.bookings?.filter(b => b.status === 'confirmed').length || 0
        const spotsLeft = cls.max_participants - confirmedBookings
        
        if (availability === 'available') {
          return spotsLeft > 0
        } else if (availability === 'waitlist') {
          return spotsLeft <= 0
        }
        return true
      })
    }

    // Location-based filtering and sorting
    if (latitude && longitude && radius) {
      classes = classes.filter(cls => {
        if (!cls.gym?.latitude || !cls.gym?.longitude) return true
        
        const distance = this.calculateDistance(
          latitude,
          longitude,
          cls.gym.latitude,
          cls.gym.longitude
        )
        
        return distance <= radius
      })

      if (sortBy === 'distance') {
        classes.sort((a, b) => {
          if (!a.gym?.latitude || !a.gym?.longitude) return 1
          if (!b.gym?.latitude || !b.gym?.longitude) return -1
          
          const distanceA = this.calculateDistance(latitude, longitude, a.gym.latitude, a.gym.longitude)
          const distanceB = this.calculateDistance(latitude, longitude, b.gym.latitude, b.gym.longitude)
          
          return distanceA - distanceB
        })
      }
    }

    return {
      classes,
      studios: [], // Studios would be fetched separately
      totalCount: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  }

  // Search studios
  async searchStudios(
    query: string, 
    location?: { lat: number; lng: number },
    radius = 25
  ): Promise<Gym[]> {
    let studioQuery = this.supabase
      .from('gyms')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (query) {
      studioQuery = studioQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`
      )
    }

    const { data: studios, error } = await studioQuery

    if (error) throw error

    let filteredStudios = studios || []

    // Filter by location if provided
    if (location && location.lat && location.lng) {
      filteredStudios = filteredStudios.filter(studio => {
        if (!studio.latitude || !studio.longitude) return true
        
        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          studio.latitude,
          studio.longitude
        )
        
        return distance <= radius
      })

      // Sort by distance
      filteredStudios.sort((a, b) => {
        if (!a.latitude || !a.longitude) return 1
        if (!b.latitude || !b.longitude) return -1
        
        const distanceA = this.calculateDistance(location.lat, location.lng, a.latitude, a.longitude)
        const distanceB = this.calculateDistance(location.lat, location.lng, b.latitude, b.longitude)
        
        return distanceA - distanceB
      })
    }

    return filteredStudios
  }

  // Get search suggestions
  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = []

    if (query.length < 2) return suggestions

    try {
      // Get class name suggestions
      const { data: classes } = await this.supabase
        .from('fitness_classes')
        .select('name')
        .ilike('name', `%${query}%`)
        .eq('status', 'scheduled')
        .limit(5)

      classes?.forEach(cls => {
        suggestions.push({
          type: 'class',
          value: cls.name
        })
      })

      // Get instructor suggestions
      const { data: instructors } = await this.supabase
        .from('fitness_classes')
        .select('instructor_name')
        .ilike('instructor_name', `%${query}%`)
        .eq('status', 'scheduled')
        .limit(5)

      const uniqueInstructors = [...new Set(instructors?.map(i => i.instructor_name) || [])]
      uniqueInstructors.forEach(instructor => {
        if (instructor) {
          suggestions.push({
            type: 'instructor',
            value: instructor
          })
        }
      })

      // Get category suggestions
      const { data: categories } = await this.supabase
        .from('fitness_classes')
        .select('category')
        .ilike('category', `%${query}%`)
        .eq('status', 'scheduled')
        .limit(5)

      const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])]
      uniqueCategories.forEach(category => {
        if (category) {
          suggestions.push({
            type: 'category',
            value: category
          })
        }
      })

      // Get studio suggestions
      const { data: studios } = await this.supabase
        .from('gyms')
        .select('name')
        .ilike('name', `%${query}%`)
        .eq('status', 'active')
        .limit(5)

      studios?.forEach(studio => {
        suggestions.push({
          type: 'studio',
          value: studio.name
        })
      })

    } catch (error) {
      console.error('Error getting suggestions:', error)
    }

    return suggestions.slice(0, 10) // Limit total suggestions
  }

  // Get popular searches
  async getPopularSearches(): Promise<string[]> {
    // In a real implementation, you'd track search queries and return the most popular ones
    // For demo, return static popular searches
    return [
      'Yoga',
      'HIIT',
      'Pilates',
      'Spin',
      'CrossFit',
      'Zumba',
      'Morning classes',
      'Beginner friendly',
      'High intensity'
    ]
  }

  // Get available categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('fitness_classes')
      .select('category')
      .eq('status', 'scheduled')
      .not('category', 'is', null)

    if (error) throw error

    const categories = [...new Set(data?.map(item => item.category) || [])]
    return categories.filter(Boolean).sort()
  }

  // Get available instructors
  async getInstructors(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('fitness_classes')
      .select('instructor_name')
      .eq('status', 'scheduled')
      .not('instructor_name', 'is', null)

    if (error) throw error

    const instructors = [...new Set(data?.map(item => item.instructor_name) || [])]
    return instructors.filter(Boolean).sort()
  }

  // Get available locations
  async getLocations(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('gyms')
      .select('city, address')
      .eq('status', 'active')

    if (error) throw error

    const locations = new Set<string>()
    data?.forEach(gym => {
      if (gym.city) locations.add(gym.city)
      // You could also extract neighborhoods from addresses
    })

    return Array.from(locations).sort()
  }

  // Advanced search with multiple filters
  async advancedSearch(filters: SearchFilters & {
    hasParking?: boolean
    hasShowers?: boolean
    wheelchairAccessible?: boolean
    priceRange?: [number, number]
  }): Promise<SearchResults> {
    // This would extend the basic search with more complex filtering
    const basicResults = await this.searchClasses(filters)

    // Apply additional filters
    let filteredClasses = basicResults.classes

    if (filters.hasParking) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.gym?.amenities?.includes('parking')
      )
    }

    if (filters.hasShowers) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.gym?.amenities?.includes('showers')
      )
    }

    if (filters.wheelchairAccessible) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.gym?.wheelchair_accessible === true
      )
    }

    return {
      ...basicResults,
      classes: filteredClasses
    }
  }

  // Save search for analytics
  async logSearch(query: string, filters: SearchFilters, resultCount: number, userId?: string) {
    try {
      // In a real implementation, you'd save this to a search_logs table
      console.log('Search logged:', {
        query,
        filters,
        resultCount,
        userId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error logging search:', error)
    }
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Get trending classes (most booked in last 7 days)
  async getTrendingClasses(limit = 10): Promise<FitnessClass[]> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await this.supabase
      .from('fitness_classes')
      .select(`
        *,
        gym:gyms(*),
        bookings!inner(id)
      `)
      .eq('status', 'scheduled')
      .gte('start_time', new Date().toISOString())
      .gte('bookings.created_at', sevenDaysAgo.toISOString())
      .order('current_participants', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // Get recommended classes based on user preferences
  async getRecommendations(
    userId: string, 
    limit = 10
  ): Promise<FitnessClass[]> {
    // This would use ML or collaborative filtering in a real implementation
    // For demo, return classes similar to user's booking history
    
    try {
      // Get user's booking history to understand preferences
      const { data: userBookings } = await this.supabase
        .from('bookings')
        .select(`
          fitness_class:fitness_classes(category, difficulty, instructor_name)
        `)
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .limit(50)

      if (!userBookings?.length) {
        // New user - return popular classes
        return this.getTrendingClasses(limit)
      }

      // Find user's preferred categories and instructors
      const categories = userBookings.map(b => b.fitness_class?.category).filter(Boolean)
      const instructors = userBookings.map(b => b.fitness_class?.instructor_name).filter(Boolean)
      
      const preferredCategory = this.getMostFrequent(categories)
      const preferredInstructor = this.getMostFrequent(instructors)

      // Get recommendations
      let query = this.supabase
        .from('fitness_classes')
        .select('*, gym:gyms(*)')
        .eq('status', 'scheduled')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(limit)

      if (preferredCategory) {
        query = query.eq('category', preferredCategory)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []

    } catch (error) {
      console.error('Error getting recommendations:', error)
      return this.getTrendingClasses(limit)
    }
  }

  private getMostFrequent<T>(arr: T[]): T | null {
    const frequency: Record<string, number> = {}
    let maxCount = 0
    let mostFrequent: T | null = null

    arr.forEach(item => {
      const key = String(item)
      frequency[key] = (frequency[key] || 0) + 1
      if (frequency[key] > maxCount) {
        maxCount = frequency[key]
        mostFrequent = item
      }
    })

    return mostFrequent
  }
}

export const searchManager = new SearchManager()