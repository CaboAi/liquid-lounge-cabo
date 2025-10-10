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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received booking notification request')
    
    // Get the booking data from the request
    const bookingData = await req.json()
    console.log('Booking data:', { 
      name: `${bookingData.firstName} ${bookingData.lastName}`,
      therapy: bookingData.preferredTherapy 
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
