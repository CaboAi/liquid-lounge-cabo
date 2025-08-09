// Credit management hook for Cabo Fit Pass

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase/client";

export type BookingResult = { success: boolean; error?: string; current_balance?: number; required_credits?: number; shortage?: number };

export function useCredits() {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
    
    // Subscribe to credit changes
    const channel = supabase
      .channel('credit-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_credits' },
        () => {
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCredits(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        setCredits(0);
      } else {
        setCredits(data?.balance || 0);
      }
    } catch (error) {
      console.error('Error in fetchCredits:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  const deductCredits = async (amount: number): Promise<BookingResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // First check current balance
      const { data: currentData, error: fetchError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        return { success: false, error: 'Failed to fetch current balance' };
      }

      const currentBalance = currentData?.balance || 0;

      if (currentBalance < amount) {
        return { 
          success: false, 
          error: 'Insufficient credits',
          current_balance: currentBalance,
          required_credits: amount,
          shortage: amount - currentBalance
        };
      }

      // Deduct credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ balance: currentBalance - amount })
        .eq('user_id', user.id);

      if (updateError) {
        return { success: false, error: 'Failed to deduct credits' };
      }

      // Update local state
      setCredits(currentBalance - amount);
      
      return { success: true, current_balance: currentBalance - amount };
    } catch (error) {
      console.error('Error deducting credits:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const addCredits = async (amount: number): Promise<BookingResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data: currentData, error: fetchError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        return { success: false, error: 'Failed to fetch current balance' };
      }

      const currentBalance = currentData?.balance || 0;
      const newBalance = currentBalance + amount;

      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) {
        return { success: false, error: 'Failed to add credits' };
      }

      setCredits(newBalance);
      
      return { success: true, current_balance: newBalance };
    } catch (error) {
      console.error('Error adding credits:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  return {
    credits,
    loading,
    deductCredits,
    addCredits,
    refetch: fetchCredits
  };
}
