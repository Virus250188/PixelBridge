/**
 * Platform API Module
 * All platform-related API calls
 */

import apiClient from './client';

export const platformApi = {
  /**
   * Get all platforms
   */
  getPlatforms: async (includeRomCount = false) => {
    const params = includeRomCount ? '?include_rom_count=true' : '';
    const response = await apiClient.get(`/platforms${params}`);
    return response.data;
  },

  /**
   * Get single platform by ID
   */
  getPlatformById: async (id) => {
    const response = await apiClient.get(`/platforms/${id}`);
    return response.data;
  },

  /**
   * Get ROMs for a specific platform
   */
  getPlatformRoms: async (id) => {
    const response = await apiClient.get(`/platforms/${id}/roms`);
    return response.data;
  },

  /**
   * Search platforms
   */
  searchPlatforms: async (query) => {
    const response = await apiClient.get(`/platforms/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
