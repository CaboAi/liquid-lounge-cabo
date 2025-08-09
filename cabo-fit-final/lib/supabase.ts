import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simple function to test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('classes').select('count')
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

// Simple function to get classes
export async function getClasses() {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, title, start_time, end_time, capacity, price, instructor, difficulty')
      .limit(10)
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}
