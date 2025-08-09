'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Booking, Profile } from '@/types/database.types'

interface BookingWithUser extends Booking {
  user?: Profile
  class_name?: string
  class_time?: string
}

interface BookingManagerProps {
  bookings?: BookingWithUser[]
  onConfirmBooking?: (bookingId: string) => void
  onCancelBooking?: (bookingId: string) => void
  onCheckIn?: (bookingId: string) => void
  onContactUser?: (userId: string) => void
  onExport?: () => void
  loading?: boolean
  className?: string
}

export function BookingManager({
  bookings = [],
  onConfirmBooking,
  onCancelBooking,
  onCheckIn,
  onContactUser,
  onExport,
  loading = false,
  className
}: BookingManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  
  const itemsPerPage = 10

  // Mock data for demonstration
  const mockBookings: BookingWithUser[] = [
    {
      id: '1',
      user_id: 'user1',
      class_id: 'class1',
      class_name: 'Morning Yoga',
      class_time: '2024-01-10T06:30:00',
      status: 'confirmed',
      booking_date: new Date().toISOString(),
      attended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: 'user1',
        email: 'john.doe@example.com',
        full_name: 'John Doe',
        phone: '+1 234-567-8900',
        role: 'user',
        status: 'active',
        monthly_credits: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: '2',
      user_id: 'user2',
      class_id: 'class1',
      class_name: 'HIIT Training',
      class_time: '2024-01-10T08:00:00',
      status: 'waitlisted',
      booking_date: new Date().toISOString(),
      attended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: 'user2',
        email: 'jane.smith@example.com',
        full_name: 'Jane Smith',
        phone: '+1 234-567-8901',
        role: 'user',
        status: 'active',
        monthly_credits: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: '3',
      user_id: 'user3',
      class_id: 'class2',
      class_name: 'Pilates',
      class_time: '2024-01-10T10:00:00',
      status: 'confirmed',
      booking_date: new Date().toISOString(),
      attended: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: 'user3',
        email: 'mike.wilson@example.com',
        full_name: 'Mike Wilson',
        phone: '+1 234-567-8902',
        role: 'user',
        status: 'active',
        monthly_credits: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  ]

  const displayBookings = bookings.length > 0 ? bookings : mockBookings

  // Filter bookings
  const filteredBookings = displayBookings.filter(booking => {
    const matchesSearch = 
      booking.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(new Set(paginatedBookings.map(b => b.id)))
    } else {
      setSelectedBookings(new Set())
    }
  }

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    const newSelection = new Set(selectedBookings)
    if (checked) {
      newSelection.add(bookingId)
    } else {
      newSelection.delete(bookingId)
    }
    setSelectedBookings(newSelection)
  }

  const getStatusBadge = (status: string, attended?: boolean) => {
    if (attended) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Attended
        </Badge>
      )
    }
    
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'waitlisted':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Waitlisted
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-gray-500">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const showUserDetails = (user: Profile) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>
                Manage class bookings and attendance
              </CardDescription>
            </div>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>Today's Classes</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>This Week</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Has Attended</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>First Time</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bulk Actions */}
          {selectedBookings.size > 0 && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedBookings.size} selected
              </span>
              <Button variant="outline" size="sm">
                Confirm All
              </Button>
              <Button variant="outline" size="sm">
                Cancel All
              </Button>
              <Button variant="outline" size="sm">
                Send Message
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedBookings.size === paginatedBookings.length && paginatedBookings.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBookings.map((booking) => {
                    const { date, time } = formatDateTime(booking.class_time || booking.booking_date)
                    const bookedDate = formatDateTime(booking.booking_date).date
                    
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBookings.has(booking.id)}
                            onCheckedChange={(checked) => 
                              handleSelectBooking(booking.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.user?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {booking.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <button
                                onClick={() => booking.user && showUserDetails(booking.user)}
                                className="font-medium hover:underline text-left"
                              >
                                {booking.user?.full_name || 'Unknown'}
                              </button>
                              <p className="text-xs text-muted-foreground">
                                {booking.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.class_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{date}</p>
                            <p className="text-sm text-muted-foreground">{time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status, booking.attended)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{bookedDate}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {booking.status === 'confirmed' && !booking.attended && (
                                <DropdownMenuItem onClick={() => onCheckIn?.(booking.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Check In
                                </DropdownMenuItem>
                              )}
                              {booking.status === 'waitlisted' && (
                                <DropdownMenuItem onClick={() => onConfirmBooking?.(booking.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Booking
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => onContactUser?.(booking.user_id)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onCancelBooking?.(booking.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              View member information and booking history
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>
                    {selectedUser.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.phone || 'No phone number'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Status: {selectedUser.status}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              selectedUser && onContactUser?.(selectedUser.id)
              setShowUserDialog(false)
            }}>
              <Mail className="h-4 w-4 mr-2" />
              Contact Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}