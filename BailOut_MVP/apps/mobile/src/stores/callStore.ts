import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Call,
  TriggerCallRequest,
  CallHistoryResponse,
} from '@bailout/shared/types/call.types';

// Call store state interface
interface CallState {
  // State
  activeCall: Call | null;
  callHistory: Call[];
  isLoading: boolean;
  isTriggering: boolean;
  error: string | null;
  pagination: {
    total: number;
    hasMore: boolean;
    limit: number;
    offset: number;
  };

  // Actions
  triggerCall: (request: TriggerCallRequest) => Promise<{ success: boolean; message: string; call?: Call }>;
  cancelCall: (callId: string) => Promise<{ success: boolean; message: string }>;
  loadHistory: (limit?: number, offset?: number) => Promise<void>;
  deleteCall: (callId: string) => Promise<{ success: boolean; message: string }>;
  refreshActiveCall: () => Promise<void>;
  clearHistory: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setTriggering: (triggering: boolean) => void;
}

// Mock call service - in real app this would call the API
const mockCallService = {
  async triggerCall(request: TriggerCallRequest): Promise<{ success: boolean; data?: { call: Call }; error?: { message: string } }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = new Date();
    const scheduledFor = request.timing === 'immediate'
      ? now
      : new Date(now.getTime() + (request.delayMinutes || 0) * 60 * 1000);

    const newCall: Call = {
      id: `call_${Date.now()}`,
      userId: 'user_123', // Get from auth store in real app
      scenarioId: request.scenarioId,
      scheduledFor,
      triggeredAt: now,
      status: request.timing === 'immediate' ? 'in_progress' : 'scheduled',
      callerType: 'mom', // Get from scenario in real app
    };

    return {
      success: true,
      data: { call: newCall }
    };
  },

  async cancelCall(callId: string): Promise<{ success: boolean; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async getHistory(limit = 20, offset = 0): Promise<{ success: boolean; data?: CallHistoryResponse; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data
    const mockCalls: Call[] = [
      {
        id: 'call_1',
        userId: 'user_123',
        scenarioId: 'scenario_1',
        scheduledFor: new Date(Date.now() - 3600000),
        triggeredAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3400000),
        status: 'completed',
        duration: 120,
        callerType: 'mom',
      },
      {
        id: 'call_2',
        userId: 'user_123',
        scenarioId: 'scenario_2',
        scheduledFor: new Date(Date.now() - 7200000),
        triggeredAt: new Date(Date.now() - 7200000),
        status: 'canceled',
        callerType: 'boss',
      },
    ];

    return {
      success: true,
      data: {
        calls: mockCalls.slice(offset, offset + limit),
        total: mockCalls.length,
        hasMore: offset + limit < mockCalls.length,
      }
    };
  },

  async deleteCall(callId: string): Promise<{ success: boolean; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },

  async getActiveCall(): Promise<{ success: boolean; data?: { call: Call | null }; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      success: true,
      data: { call: null }
    };
  },
};

// Initial state
const initialState = {
  activeCall: null,
  callHistory: [],
  isLoading: false,
  isTriggering: false,
  error: null,
  pagination: {
    total: 0,
    hasMore: false,
    limit: 20,
    offset: 0,
  },
};

// Create the call store
export const useCallStore = create<CallState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Trigger a new call
      triggerCall: async (request: TriggerCallRequest) => {
        set({ isTriggering: true, error: null });

        try {
          const response = await mockCallService.triggerCall(request);

          if (response.success && response.data) {
            const { call } = response.data;

            // If immediate call, set as active call
            if (call.status === 'in_progress') {
              set({ activeCall: call });
            }

            // Add to history
            set((state) => ({
              callHistory: [call, ...state.callHistory],
              isTriggering: false,
            }));

            return {
              success: true,
              message: call.status === 'scheduled'
                ? `Call scheduled for ${call.scheduledFor.toLocaleTimeString()}`
                : 'Bailout call triggered!',
              call,
            };
          } else {
            set({ isTriggering: false, error: response.error?.message || 'Failed to trigger call' });
            return {
              success: false,
              message: response.error?.message || 'Failed to trigger call',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to trigger call';
          set({ isTriggering: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Cancel an active or scheduled call
      cancelCall: async (callId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockCallService.cancelCall(callId);

          if (response.success) {
            // Update call status in history
            set((state) => ({
              callHistory: state.callHistory.map(call =>
                call.id === callId ? { ...call, status: 'canceled' as const } : call
              ),
              activeCall: state.activeCall?.id === callId ? null : state.activeCall,
              isLoading: false,
            }));

            return {
              success: true,
              message: 'Call canceled successfully',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to cancel call' });
            return {
              success: false,
              message: response.error?.message || 'Failed to cancel call',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to cancel call';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Load call history
      loadHistory: async (limit = 20, offset = 0) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockCallService.getHistory(limit, offset);

          if (response.success && response.data) {
            const { calls, total, hasMore } = response.data;

            set((state) => ({
              callHistory: offset === 0 ? calls : [...state.callHistory, ...calls],
              pagination: {
                ...state.pagination,
                total,
                hasMore,
                limit,
                offset: offset + calls.length,
              },
              isLoading: false,
            }));
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to load call history' });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load call history';
          set({ isLoading: false, error: errorMessage });
        }
      },

      // Delete a call from history
      deleteCall: async (callId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockCallService.deleteCall(callId);

          if (response.success) {
            set((state) => ({
              callHistory: state.callHistory.filter(call => call.id !== callId),
              pagination: {
                ...state.pagination,
                total: state.pagination.total - 1,
              },
              isLoading: false,
            }));

            return {
              success: true,
              message: 'Call deleted successfully',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to delete call' });
            return {
              success: false,
              message: response.error?.message || 'Failed to delete call',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete call';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Refresh active call status
      refreshActiveCall: async () => {
        try {
          const response = await mockCallService.getActiveCall();

          if (response.success && response.data) {
            set({ activeCall: response.data.call });
          }
        } catch (error) {
          console.error('Failed to refresh active call:', error);
        }
      },

      // Clear call history
      clearHistory: () => {
        set({
          callHistory: [],
          pagination: {
            total: 0,
            hasMore: false,
            limit: 20,
            offset: 0,
          },
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set triggering state
      setTriggering: (triggering: boolean) => {
        set({ isTriggering: triggering });
      },
    }),
    {
      name: 'call-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist call history, not loading states
        callHistory: state.callHistory,
        pagination: state.pagination,
      }),
      onRehydrateStorage: () => (state) => {
        // Reset loading states on rehydration
        if (state) {
          state.isLoading = false;
          state.isTriggering = false;
          state.error = null;
          state.activeCall = null; // Active calls shouldn't persist
        }
      },
    }
  )
);

// Hook for call state
export const useCall = () => {
  const store = useCallStore();
  return {
    // State
    activeCall: store.activeCall,
    callHistory: store.callHistory,
    isLoading: store.isLoading,
    isTriggering: store.isTriggering,
    error: store.error,
    pagination: store.pagination,

    // Actions
    triggerCall: store.triggerCall,
    cancelCall: store.cancelCall,
    loadHistory: store.loadHistory,
    deleteCall: store.deleteCall,
    refreshActiveCall: store.refreshActiveCall,
    clearHistory: store.clearHistory,
    clearError: store.clearError,
    setLoading: store.setLoading,
    setTriggering: store.setTriggering,
  };
};

// Selector hooks for specific data
export const useActiveCall = () => useCallStore((state) => state.activeCall);
export const useCallHistory = () => useCallStore((state) => state.callHistory);
export const useCallLoading = () => useCallStore((state) => state.isLoading);
export const useCallTriggering = () => useCallStore((state) => state.isTriggering);
export const useCallError = () => useCallStore((state) => state.error);

export default useCallStore;