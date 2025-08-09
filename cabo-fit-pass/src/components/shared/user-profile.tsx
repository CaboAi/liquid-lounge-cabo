'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Lock,
  Camera,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Profile, User as AuthUser } from '@/types/database.types'

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  timezone: z.string(),
  locale: z.string(),
  date_of_birth: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  fitness_goals: z.string().optional(),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferred_class_types: z.string().optional(),
  medical_conditions: z.string().optional(),
})

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  push_notifications: z.boolean(),
  marketing_consent: z.boolean(),
  class_reminders: z.boolean(),
  booking_confirmations: z.boolean(),
  waitlist_notifications: z.boolean(),
  promotional_offers: z.boolean(),
})

const passwordSchema = z.object({
  current_password: z.string().min(8),
  new_password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type NotificationFormValues = z.infer<typeof notificationSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

interface UserProfileProps {
  user?: AuthUser
  profile?: Profile
  onUpdateProfile?: (data: Partial<Profile>) => Promise<void>
  onUpdatePassword?: (data: { currentPassword: string; newPassword: string }) => Promise<void>
  onDeleteAccount?: () => Promise<void>
  loading?: boolean
  className?: string
}

export function UserProfile({
  user,
  profile,
  onUpdateProfile,
  onUpdatePassword,
  onDeleteAccount,
  loading = false,
  className
}: UserProfileProps) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      timezone: profile?.timezone || 'America/Mazatlan',
      locale: profile?.locale || 'en',
      date_of_birth: profile?.date_of_birth || '',
      emergency_contact_name: profile?.emergency_contact_name || '',
      emergency_contact_phone: profile?.emergency_contact_phone || '',
      fitness_goals: profile?.fitness_goals || '',
      fitness_level: profile?.fitness_level || 'intermediate',
      preferred_class_types: profile?.preferred_class_types || '',
      medical_conditions: profile?.medical_conditions || '',
    },
  })

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: profile?.email_notifications ?? true,
      sms_notifications: profile?.sms_notifications ?? false,
      push_notifications: profile?.push_notifications ?? true,
      marketing_consent: profile?.marketing_consent ?? false,
      class_reminders: profile?.class_reminders ?? true,
      booking_confirmations: profile?.booking_confirmations ?? true,
      waitlist_notifications: profile?.waitlist_notifications ?? true,
      promotional_offers: profile?.promotional_offers ?? false,
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const handleProfileUpdate = async (values: ProfileFormValues) => {
    setIsUpdatingProfile(true)
    try {
      if (onUpdateProfile) {
        await onUpdateProfile(values)
      }
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile', {
        description: 'Please try again or contact support.'
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleNotificationUpdate = async (values: NotificationFormValues) => {
    try {
      if (onUpdateProfile) {
        await onUpdateProfile(values)
      }
      toast.success('Notification preferences updated!')
    } catch (error) {
      toast.error('Failed to update notifications')
    }
  }

  const handlePasswordUpdate = async (values: PasswordFormValues) => {
    setIsUpdatingPassword(true)
    try {
      if (onUpdatePassword) {
        await onUpdatePassword({
          currentPassword: values.current_password,
          newPassword: values.new_password,
        })
      }
      toast.success('Password updated successfully!')
      passwordForm.reset()
    } catch (error) {
      toast.error('Failed to update password', {
        description: 'Please check your current password and try again.'
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (onDeleteAccount) {
        await onDeleteAccount()
      }
      toast.success('Account deleted successfully')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'staff':
        return 'Studio Staff'
      case 'user':
        return 'Member'
      default:
        return 'User'
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const
      case 'staff':
        return 'default' as const
      case 'user':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">
                  {profile?.full_name || 'User'}
                </h2>
                <Badge variant={getRoleBadgeVariant(profile?.role || 'user')}>
                  {getRoleDisplayName(profile?.role || 'user')}
                </Badge>
              </div>
              <p className="text-muted-foreground">{profile?.email || user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and fitness profile
              </CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell us about yourself..."
                            className="min-h-[100px]"
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
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City, Country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="America/Mazatlan">Pacific (Los Cabos)</SelectItem>
                              <SelectItem value="America/Mexico_City">Central (Mexico City)</SelectItem>
                              <SelectItem value="America/New_York">Eastern</SelectItem>
                              <SelectItem value="America/Chicago">Central</SelectItem>
                              <SelectItem value="America/Denver">Mountain</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Fitness Profile</h4>
                    
                    <FormField
                      control={profileForm.control}
                      name="fitness_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="fitness_goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Goals</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="What are your fitness goals?"
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="preferred_class_types"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Class Types</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., Yoga, HIIT, Pilates..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="medical_conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Any medical conditions or injuries we should know about..."
                              className="min-h-[60px]"
                            />
                          </FormControl>
                          <FormDescription>
                            This information helps instructors provide appropriate modifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Emergency Contact</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="emergency_contact_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="emergency_contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdatingProfile || loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you'd like to receive notifications
              </CardDescription>
            </CardHeader>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(handleNotificationUpdate)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Communication Channels</h4>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="email_notifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={field.name}>Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="sms_notifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={field.name}>SMS Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications via text message
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="push_notifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={field.name}>Push Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive notifications on your device
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Types</h4>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="class_reminders"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={field.name}>Class Reminders</Label>
                              <p className="text-sm text-muted-foreground">
                                Reminders for upcoming classes
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="booking_confirmations"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={field.name}>Booking Confirmations</Label>
                              <p className="text-sm text-muted-foreground">
                                Confirmations for class bookings
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="waitlist_notifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={field.name}>Waitlist Updates</Label>
                              <p className="text-sm text-muted-foreground">
                                When spots become available
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="promotional_offers"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor={field.name}>Promotional Offers</Label>
                              <p className="text-sm text-muted-foreground">
                                Special deals and offers
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdatingPassword || loading}>
                    <Lock className="h-4 w-4 mr-2" />
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Account Status</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Account Active</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Member Since</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Data Export</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Download a copy of your account data
                  </p>
                  <Button variant="outline" size="sm">
                    Download Data
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-900">Delete Account</AlertTitle>
                  <AlertDescription className="text-red-800">
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}