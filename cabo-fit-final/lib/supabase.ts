import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
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

// Get today's classes
export async function getTodaysClasses() {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('classes')
      .select('id, title, start_time, end_time, capacity, price, instructor, difficulty, gym_id')
      .gte('start_time', today + 'T00:00:00')
      .lt('start_time', today + 'T23:59:59')
      .order('start_time', { ascending: true })
    
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching classes:', error)
    return { success: false, error, data: [] }
  }
}

// Get all classes (fallback if no classes today)
export async function getAllClasses() {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, title, start_time, end_time, capacity, price, instructor, difficulty, gym_id')
      .order('start_time', { ascending: true })
      .limit(10)
    
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching all classes:', error)
    return { success: false, error, data: [] }
  }
}

// Test connection (keep existing)
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('classes').select('count')
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

// Simple function to get classes (keep existing for test component)
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
