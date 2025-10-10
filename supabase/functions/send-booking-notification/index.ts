import notificationapi from 'npm:notificationapi-node-server-sdk@1.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize NotificationAPI
notificationapi.init(
  'qiq7v19j2hezwztv1ry0ndn6ph',
  'hiu7poa906tc3tbrtexbrvtkbzdl3llt8tpuq27rdhkbubpdrkyo8gs4qy'
)

// Simple rate limiting: track last request time per IP
const rateLimitMap = new Map<string, number>()

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received booking notification request')
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting: check if IP has made a request in the last second
    const now = Date.now()
    const lastRequestTime = rateLimitMap.get(clientIP)
    
    if (lastRequestTime && now - lastRequestTime < 1000) {
      console.log('Rate limit exceeded for IP:', clientIP)
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please wait a moment.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      )
    }
    
    // Update rate limit tracker
    rateLimitMap.set(clientIP, now)
    
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
          error: `Missing required fields: ${missingFields.join(', ')}` 
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
    console.error('Error sending notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
