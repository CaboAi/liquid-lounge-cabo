import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test table structure
    const { data: tables, error: tableError } = await supabase.rpc('get_table_info')
    
    if (tableError && tableError.code !== '42883') { // Function doesn't exist is ok
      console.warn('⚠️ Could not get table info:', tableError.message)
    }
    
    console.log('📊 Available tables test completed')
    
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Unexpected error testing Supabase:', error.message)
    return { success: false, error: error.message }
  }
}

export async function testAuthFlow() {
  try {
    console.log('🔐 Testing authentication flow...')
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Auth session check failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Auth flow test completed. Current session:', session ? 'Active' : 'None')
    
    return { success: true, session }
  } catch (error: any) {
    console.error('❌ Unexpected error testing auth:', error.message)
    return { success: false, error: error.message }
  }
}