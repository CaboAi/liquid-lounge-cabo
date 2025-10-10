import notificationapi from 'npm:notificationapi-node-server-sdk@1.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize NotificationAPI with environment variables
const clientId = Deno.env.get('NOTIFICATIONAPI_CLIENT_ID')
const clientSecret = Deno.env.get('NOTIFICATIONAPI_CLIENT_SECRET')

if (!clientId || !clientSecret) {
  throw new Error('Missing NotificationAPI credentials in environment variables')
}

notificationapi.init(clientId, clientSecret)

// Rate limiting: track request counts per IP (5 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received booking notification request')
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // Rate limiting: 5 requests per minute per IP
    const rateLimit = rateLimitMap.get(clientIP)
    const oneMinute = 60 * 1000
    
    if (rateLimit) {
      // Reset counter if minute has passed
      if (now > rateLimit.resetTime) {
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + oneMinute })
      } else if (rateLimit.count >= 5) {
        console.log('Rate limit exceeded for IP:', clientIP, 'Count:', rateLimit.count)
        return new Response(
          JSON.stringify({ success: false, error: 'Unable to process booking. Please try again later or contact us directly.' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429 
          }
        )
      } else {
        rateLimit.count++
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + oneMinute })
    }
    
    // Clean up old entries (keep last 100)
    if (rateLimitMap.size > 100) {
      const firstKey = rateLimitMap.keys().next().value
      rateLimitMap.delete(firstKey)
    }
    
    // Get the booking data from the request
    const bookingData = await req.json()
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone_number']
    const missingFields = requiredFields.filter(field => !bookingData[field])
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to process booking. Please ensure all required fields are filled out.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(bookingData.email)) {
      console.log('Invalid email format:', bookingData.email)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to process booking. Please check your email address.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    // Validate phone number format (international format: +followed by digits)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(bookingData.phone_number.replace(/[\s\-\(\)]/g, ''))) {
      console.log('Invalid phone format:', bookingData.phone_number)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to process booking. Please check your phone number.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    console.log('Booking data:', { 
      name: `${bookingData.first_name} ${bookingData.last_name}`,
      email: bookingData.email,
      phone: bookingData.phone_number
    })

    // Send SMS notification to Nate (admin)
    console.log('Sending SMS notification to admin...')
    await notificationapi.send({
      notificationId: 'new_booking',
      user: {
        id: 'nate_admin',
        number: '+526242287777'
      }
    })
    console.log('SMS notification sent successfully')

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    // Log detailed error server-side
    console.error('Error in send-booking-notification:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Unable to process booking. Please try again or contact us directly.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
