import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Class {
  id: string
  title: string
  start_time: string
  end_time: string
  capacity: number
  price: number
  instructor?: string
  difficulty?: string
  gym_id: string
}

export async function getAllClasses() {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .limit(10)
    
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error, data: [] }
  }
}

export async function createBooking(booking: any) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error }
  }
}
