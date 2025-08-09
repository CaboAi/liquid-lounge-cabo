'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  MapPin,
  User,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronDown
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export interface ClassSearchFilters {
  search: string
  category?: string
  difficulty?: string
  intensity?: string
  instructor?: string
  location?: string
  duration?: [number, number]
  credits?: [number, number]
  date?: Date
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  availability?: 'available' | 'waitlist' | 'all'
  sortBy?: 'time' | 'popularity' | 'credits' | 'rating'
}

interface ClassSearchProps {
  onSearch: (filters: ClassSearchFilters) => void
  categories?: string[]
  instructors?: string[]
  locations?: string[]
  loading?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'expanded'
}

export function ClassSearch({ 
  onSearch,
  categories = [],
  instructors = [],
  locations = [],
  loading = false,
  className,
  variant = 'default'
}: ClassSearchProps) {
  const [filters, setFilters] = useState<ClassSearchFilters>({
    search: '',
    duration: [30, 90],
    credits: [1, 4],
    availability: 'available'
  })
  
  const [showFilters, setShowFilters] = useState(variant === 'expanded')
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch({ ...filters, search: debouncedSearch })
  }, [debouncedSearch])

  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.category) count++
    if (filters.difficulty) count++
    if (filters.intensity) count++
    if (filters.instructor) count++
    if (filters.location) count++
    if (filters.date) count++
    if (filters.timeOfDay) count++
    if (filters.availability !== 'available') count++
    setActiveFiltersCount(count)
  }, [filters])

  const handleFilterChange = (key: keyof ClassSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (key !== 'search') {
      onSearch(newFilters)
    }
  }

  const clearFilters = () => {
    const clearedFilters: ClassSearchFilters = {
      search: '',
      duration: [30, 90],
      credits: [1, 4],
      availability: 'available'
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  const quickFilters = [
    { label: 'Today', icon: Calendar, action: () => handleFilterChange('date', new Date()) },
    { label: 'Morning', icon: Clock, action: () => handleFilterChange('timeOfDay', 'morning') },
    { label: 'Beginner', icon: Activity, action: () => handleFilterChange('difficulty', 'beginner') },
    { label: 'High Intensity', icon: TrendingUp, action: () => handleFilterChange('intensity', 'high') },
  ]

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes, instructors..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
        
        {showFilters && (
          <div className="flex gap-2 flex-wrap">
            {quickFilters.map(filter => (
              <Button
                key={filter.label}
                variant="outline"
                size="sm"
                onClick={filter.action}
                className="h-8"
              >
                <filter.icon className="h-3 w-3 mr-1" />
                {filter.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes, instructors, or studios..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9 pr-10"
            disabled={loading}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleFilterChange('search', '')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 px-1.5 py-0 h-5 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              <Separator />
              
              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Difficulty Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Difficulty</Label>
                <RadioGroup
                  value={filters.difficulty || 'all'}
                  onValueChange={(value) => handleFilterChange('difficulty', value === 'all' ? undefined : value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-difficulty" />
                    <Label htmlFor="all-difficulty" className="text-sm font-normal">
                      All levels
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="text-sm font-normal">
                      Beginner
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="text-sm font-normal">
                      Intermediate
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="text-sm font-normal">
                      Advanced
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Intensity Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Intensity</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.intensity === 'low' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('intensity', filters.intensity === 'low' ? undefined : 'low')}
                  >
                    Low
                  </Button>
                  <Button
                    variant={filters.intensity === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('intensity', filters.intensity === 'medium' ? undefined : 'medium')}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={filters.intensity === 'high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('intensity', filters.intensity === 'high' ? undefined : 'high')}
                  >
                    High
                  </Button>
                </div>
              </div>
              
              {/* Duration Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Duration</Label>
                  <span className="text-xs text-muted-foreground">
                    {filters.duration?.[0]}-{filters.duration?.[1]} min
                  </span>
                </div>
                <Slider
                  value={filters.duration}
                  onValueChange={(value) => handleFilterChange('duration', value)}
                  min={15}
                  max={120}
                  step={15}
                  className="w-full"
                />
              </div>
              
              {/* Credits Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Credits Required</Label>
                  <span className="text-xs text-muted-foreground">
                    {filters.credits?.[0]}-{filters.credits?.[1]}
                  </span>
                </div>
                <Slider
                  value={filters.credits}
                  onValueChange={(value) => handleFilterChange('credits', value)}
                  min={1}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Instructor Filter */}
              {instructors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Instructor</Label>
                  <Select
                    value={filters.instructor}
                    onValueChange={(value) => handleFilterChange('instructor', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All instructors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All instructors</SelectItem>
                      {instructors.map(instructor => (
                        <SelectItem key={instructor} value={instructor}>
                          {instructor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Availability Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Availability</Label>
                <RadioGroup
                  value={filters.availability}
                  onValueChange={(value) => handleFilterChange('availability', value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="available" id="available" />
                    <Label htmlFor="available" className="text-sm font-normal">
                      Available only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="waitlist" id="waitlist" />
                    <Label htmlFor="waitlist" className="text-sm font-normal">
                      Include waitlist
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-availability" />
                    <Label htmlFor="all-availability" className="text-sm font-normal">
                      Show all
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Quick Filters (when expanded) */}
      {variant === 'expanded' && (
        <div className="flex gap-2 flex-wrap">
          {quickFilters.map(filter => {
            const Icon = filter.icon
            return (
              <Button
                key={filter.label}
                variant="outline"
                size="sm"
                onClick={filter.action}
                className="h-8"
              >
                <Icon className="h-3 w-3 mr-1" />
                {filter.label}
              </Button>
            )
          })}
          
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <>
              <Separator orientation="vertical" className="h-8" />
              {filters.category && (
                <Badge variant="secondary" className="h-8 px-2">
                  {filters.category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleFilterChange('category', undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.difficulty && (
                <Badge variant="secondary" className="h-8 px-2">
                  {filters.difficulty}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleFilterChange('difficulty', undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.intensity && (
                <Badge variant="secondary" className="h-8 px-2">
                  {filters.intensity} intensity
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleFilterChange('intensity', undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}