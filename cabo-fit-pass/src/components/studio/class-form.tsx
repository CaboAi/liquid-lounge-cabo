'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Activity,
  AlertCircle,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { FitnessClass } from '@/types/database.types'

const classFormSchema = z.object({
  name: z.string().min(3, 'Class name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  instructor_name: z.string().min(2, 'Instructor name is required'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  intensity: z.enum(['low', 'medium', 'high']),
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  duration: z.number().min(15).max(180),
  max_participants: z.number().min(1).max(50),
  credits_required: z.number().min(1).max(10),
  location: z.string().min(1, 'Location is required'),
  recurring: z.boolean().default(false),
  recurrence_pattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  recurrence_end_date: z.string().optional(),
  equipment_needed: z.string().optional(),
  prerequisites: z.string().optional(),
  cancellation_policy: z.string().optional(),
})

type ClassFormValues = z.infer<typeof classFormSchema>

interface ClassFormProps {
  initialData?: Partial<FitnessClass>
  onSubmit?: (data: ClassFormValues) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  className?: string
}

export function ClassForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  className
}: ClassFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      instructor_name: initialData?.instructor_name || '',
      category: initialData?.category || '',
      difficulty: initialData?.difficulty || 'intermediate',
      intensity: initialData?.intensity || 'medium',
      start_date: initialData?.start_time ? new Date(initialData.start_time).toISOString().split('T')[0] : '',
      start_time: initialData?.start_time ? new Date(initialData.start_time).toTimeString().slice(0, 5) : '',
      duration: initialData?.duration || 60,
      max_participants: initialData?.max_participants || 15,
      credits_required: initialData?.credits_required || 2,
      location: initialData?.location || '',
      recurring: false,
      recurrence_pattern: 'weekly',
      equipment_needed: initialData?.equipment_needed || '',
      prerequisites: initialData?.prerequisites || '',
      cancellation_policy: initialData?.cancellation_policy || '2 hours before class',
    },
  })

  const isRecurring = form.watch('recurring')
  const duration = form.watch('duration')
  const maxParticipants = form.watch('max_participants')
  const creditsRequired = form.watch('credits_required')

  const categories = [
    'Yoga',
    'Pilates',
    'HIIT',
    'Strength Training',
    'Cardio',
    'Dance',
    'Martial Arts',
    'Cycling',
    'Swimming',
    'CrossFit',
    'Barre',
    'Meditation',
    'Other'
  ]

  const instructors = [
    'Sarah Johnson',
    'Mike Chen',
    'Emma Davis',
    'Carlos Rodriguez',
    'Lisa Thompson',
    'James Wilson'
  ]

  const locations = [
    'Studio A',
    'Studio B',
    'Pool Area',
    'Outdoor Space',
    'Gym Floor',
    'Spin Room'
  ]

  async function handleSubmit(values: ClassFormValues) {
    setIsSubmitting(true)
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${values.start_date}T${values.start_time}`)
      
      const formData = {
        ...values,
        start_time: startDateTime.toISOString(),
      }
      
      if (onSubmit) {
        await onSubmit(formData)
      }
      
      toast.success(initialData ? 'Class updated successfully!' : 'Class created successfully!', {
        description: values.recurring ? `${values.recurrence_pattern} recurring classes scheduled` : undefined,
      })
      
      router.push('/studio/classes')
    } catch (error) {
      toast.error('Failed to save class', {
        description: 'Please check your input and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Class' : 'Create New Class'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update class details' : 'Schedule a new fitness class'}
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Morning Power Yoga" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what participants can expect from this class..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instructor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instructors.map(instructor => (
                            <SelectItem key={instructor} value={instructor}>
                              {instructor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Class Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Class Settings</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <Label htmlFor="beginner">Beginner</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="intermediate" id="intermediate" />
                            <Label htmlFor="intermediate">Intermediate</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <Label htmlFor="advanced">Advanced</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low" />
                            <Label htmlFor="low">Low</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high">High</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Duration</FormLabel>
                      <span className="text-sm font-medium">{field.value} minutes</span>
                    </div>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        min={15}
                        max={180}
                        step={15}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Class duration in minutes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="max_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Participants</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            min={1} 
                            max={50}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="credits_required"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits Required</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            min={1} 
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Recurring Class</FormLabel>
                      <FormDescription>
                        Schedule this class to repeat automatically
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {isRecurring && (
                <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
                  <FormField
                    control={form.control}
                    name="recurrence_pattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence Pattern</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recurrence_end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          When should the recurring classes end?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            
            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="equipment_needed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Needed (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Yoga mat, water bottle, towel..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prerequisites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prerequisites (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any requirements or recommendations for participants..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cancellation_policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Policy</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 hours before class" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Summary */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Class Summary:</strong> {duration} minute {form.watch('intensity')} intensity {form.watch('category')} class 
                for up to {maxParticipants} participants, requiring {creditsRequired} credit{creditsRequired !== 1 ? 's' : ''}.
                {isRecurring && ` Repeats ${form.watch('recurrence_pattern')}.`}
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : initialData ? 'Update Class' : 'Create Class'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => router.push('/studio/classes'))}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}