import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Scenario,
  CreateScenarioRequest,
  UpdateScenarioRequest,
  DEFAULT_SCENARIOS,
  CallerType,
} from '@bailout/shared/types/scenario.types';

// Scenario store state interface
interface ScenarioState {
  // State
  scenarios: Scenario[];
  favorites: string[]; // scenario IDs
  recentlyUsed: string[]; // scenario IDs (most recent first)
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeFilter: 'all' | 'recent' | 'favorites';

  // Actions
  loadScenarios: () => Promise<void>;
  createScenario: (data: CreateScenarioRequest) => Promise<{ success: boolean; message: string; scenario?: Scenario }>;
  updateScenario: (id: string, data: UpdateScenarioRequest) => Promise<{ success: boolean; message: string }>;
  deleteScenario: (id: string) => Promise<{ success: boolean; message: string }>;
  toggleFavorite: (scenarioId: string) => void;
  markAsUsed: (scenarioId: string) => void;
  searchScenarios: (query: string) => void;
  setActiveFilter: (filter: 'all' | 'recent' | 'favorites') => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

  // Computed getters
  getFilteredScenarios: () => Scenario[];
  getScenarioById: (id: string) => Scenario | undefined;
  getScenariosByCallerType: (callerType: CallerType) => Scenario[];
}

// Mock scenario service - in real app this would call the API
const mockScenarioService = {
  async getScenarios(): Promise<{ success: boolean; data?: { scenarios: Scenario[] }; error?: { message: string } }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create mock scenarios from defaults
    const scenarios: Scenario[] = DEFAULT_SCENARIOS.map((scenario, index) => ({
      ...scenario,
      id: `scenario_${index + 1}`,
      userId: null, // Default scenarios
      isFavorite: false,
      usageCount: Math.floor(Math.random() * 10),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
    }));

    return {
      success: true,
      data: { scenarios }
    };
  },

  async createScenario(data: CreateScenarioRequest): Promise<{ success: boolean; data?: { scenario: Scenario }; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newScenario: Scenario = {
      id: `scenario_${Date.now()}`,
      userId: 'user_123', // Get from auth store in real app
      ...data,
      isDefault: false,
      isFavorite: false,
      usageCount: 0,
      createdAt: new Date(),
    };

    return {
      success: true,
      data: { scenario: newScenario }
    };
  },

  async updateScenario(id: string, data: UpdateScenarioRequest): Promise<{ success: boolean; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async deleteScenario(id: string): Promise<{ success: boolean; error?: { message: string } }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
};

// Initial state
const initialState = {
  scenarios: [],
  favorites: [],
  recentlyUsed: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  activeFilter: 'all' as const,
};

// Create the scenario store
export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Load scenarios from API
      loadScenarios: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockScenarioService.getScenarios();

          if (response.success && response.data) {
            const { scenarios } = response.data;

            // Merge favorites from stored state
            const { favorites } = get();
            const scenariosWithFavorites = scenarios.map(scenario => ({
              ...scenario,
              isFavorite: favorites.includes(scenario.id),
            }));

            set({
              scenarios: scenariosWithFavorites,
              isLoading: false,
            });
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to load scenarios' });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load scenarios';
          set({ isLoading: false, error: errorMessage });
        }
      },

      // Create a new custom scenario
      createScenario: async (data: CreateScenarioRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockScenarioService.createScenario(data);

          if (response.success && response.data) {
            const { scenario } = response.data;

            set((state) => ({
              scenarios: [scenario, ...state.scenarios],
              isLoading: false,
            }));

            return {
              success: true,
              message: 'Scenario created successfully',
              scenario,
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to create scenario' });
            return {
              success: false,
              message: response.error?.message || 'Failed to create scenario',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create scenario';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Update an existing scenario
      updateScenario: async (id: string, data: UpdateScenarioRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockScenarioService.updateScenario(id, data);

          if (response.success) {
            set((state) => ({
              scenarios: state.scenarios.map(scenario =>
                scenario.id === id ? { ...scenario, ...data } : scenario
              ),
              isLoading: false,
            }));

            return {
              success: true,
              message: 'Scenario updated successfully',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to update scenario' });
            return {
              success: false,
              message: response.error?.message || 'Failed to update scenario',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update scenario';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Delete a scenario
      deleteScenario: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await mockScenarioService.deleteScenario(id);

          if (response.success) {
            set((state) => ({
              scenarios: state.scenarios.filter(scenario => scenario.id !== id),
              favorites: state.favorites.filter(favId => favId !== id),
              recentlyUsed: state.recentlyUsed.filter(recentId => recentId !== id),
              isLoading: false,
            }));

            return {
              success: true,
              message: 'Scenario deleted successfully',
            };
          } else {
            set({ isLoading: false, error: response.error?.message || 'Failed to delete scenario' });
            return {
              success: false,
              message: response.error?.message || 'Failed to delete scenario',
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete scenario';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },

      // Toggle favorite status
      toggleFavorite: (scenarioId: string) => {
        set((state) => {
          const isFavorite = state.favorites.includes(scenarioId);
          const newFavorites = isFavorite
            ? state.favorites.filter(id => id !== scenarioId)
            : [...state.favorites, scenarioId];

          // Update scenarios array as well
          const updatedScenarios = state.scenarios.map(scenario =>
            scenario.id === scenarioId
              ? { ...scenario, isFavorite: !isFavorite }
              : scenario
          );

          return {
            favorites: newFavorites,
            scenarios: updatedScenarios,
          };
        });
      },

      // Mark scenario as recently used
      markAsUsed: (scenarioId: string) => {
        set((state) => {
          // Remove from current position if exists, then add to front
          const newRecentlyUsed = [
            scenarioId,
            ...state.recentlyUsed.filter(id => id !== scenarioId)
          ].slice(0, 10); // Keep only last 10

          // Increment usage count
          const updatedScenarios = state.scenarios.map(scenario =>
            scenario.id === scenarioId
              ? { ...scenario, usageCount: scenario.usageCount + 1 }
              : scenario
          );

          return {
            recentlyUsed: newRecentlyUsed,
            scenarios: updatedScenarios,
          };
        });
      },

      // Set search query
      searchScenarios: (query: string) => {
        set({ searchQuery: query });
      },

      // Set active filter
      setActiveFilter: (filter: 'all' | 'recent' | 'favorites') => {
        set({ activeFilter: filter });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Get filtered scenarios based on search and filter
      getFilteredScenarios: () => {
        const { scenarios, searchQuery, activeFilter, favorites, recentlyUsed } = get();

        let filtered = scenarios;

        // Apply filter
        switch (activeFilter) {
          case 'favorites':
            filtered = scenarios.filter(scenario => scenario.isFavorite);
            break;
          case 'recent':
            filtered = scenarios.filter(scenario => recentlyUsed.includes(scenario.id))
              .sort((a, b) => recentlyUsed.indexOf(a.id) - recentlyUsed.indexOf(b.id));
            break;
          default:
            filtered = scenarios;
        }

        // Apply search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(scenario =>
            scenario.title.toLowerCase().includes(query) ||
            scenario.description.toLowerCase().includes(query) ||
            scenario.callerType.toLowerCase().includes(query)
          );
        }

        return filtered;
      },

      // Get scenario by ID
      getScenarioById: (id: string) => {
        const { scenarios } = get();
        return scenarios.find(scenario => scenario.id === id);
      },

      // Get scenarios by caller type
      getScenariosByCallerType: (callerType: CallerType) => {
        const { scenarios } = get();
        return scenarios.filter(scenario => scenario.callerType === callerType);
      },
    }),
    {
      name: 'scenario-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist scenarios, favorites, and recently used
        scenarios: state.scenarios,
        favorites: state.favorites,
        recentlyUsed: state.recentlyUsed,
      }),
      onRehydrateStorage: () => (state) => {
        // Reset loading and search states on rehydration
        if (state) {
          state.isLoading = false;
          state.error = null;
          state.searchQuery = '';
          state.activeFilter = 'all';
        }
      },
    }
  )
);

// Hook for scenario state
export const useScenario = () => {
  const store = useScenarioStore();
  return {
    // State
    scenarios: store.scenarios,
    favorites: store.favorites,
    recentlyUsed: store.recentlyUsed,
    isLoading: store.isLoading,
    error: store.error,
    searchQuery: store.searchQuery,
    activeFilter: store.activeFilter,

    // Actions
    loadScenarios: store.loadScenarios,
    createScenario: store.createScenario,
    updateScenario: store.updateScenario,
    deleteScenario: store.deleteScenario,
    toggleFavorite: store.toggleFavorite,
    markAsUsed: store.markAsUsed,
    searchScenarios: store.searchScenarios,
    setActiveFilter: store.setActiveFilter,
    clearError: store.clearError,
    setLoading: store.setLoading,

    // Computed
    filteredScenarios: store.getFilteredScenarios(),
    getScenarioById: store.getScenarioById,
    getScenariosByCallerType: store.getScenariosByCallerType,
  };
};

// Selector hooks for specific data
export const useScenarios = () => useScenarioStore((state) => state.scenarios);
export const useFavoriteScenarios = () => useScenarioStore((state) =>
  state.scenarios.filter(scenario => state.favorites.includes(scenario.id))
);
export const useRecentScenarios = () => useScenarioStore((state) => {
  return state.recentlyUsed
    .map(id => state.scenarios.find(scenario => scenario.id === id))
    .filter((scenario): scenario is Scenario => scenario !== undefined)
    .slice(0, 5); // Show top 5 recent
});
export const useScenarioLoading = () => useScenarioStore((state) => state.isLoading);
export const useScenarioError = () => useScenarioStore((state) => state.error);

export default useScenarioStore;