/**
 * Zustand Store
 * Global state management
 */

import { create } from 'zustand';

export const useStore = create((set) => ({
  // Selected platform filter
  selectedPlatform: null,
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  // Search query
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // View mode (grid or list)
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Selected ROM for details
  selectedRom: null,
  setSelectedRom: (rom) => set({ selectedRom: rom }),

  // Upload progress
  uploadProgress: 0,
  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  // Filters
  showFavoritesOnly: false,
  toggleFavoritesFilter: () => set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),

  // Reset all filters
  resetFilters: () => set({
    selectedPlatform: null,
    searchQuery: '',
    showFavoritesOnly: false,
  }),
}));
