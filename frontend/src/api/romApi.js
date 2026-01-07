/**
 * ROM API Module
 * All ROM-related API calls
 */

import apiClient from './client';

export const romApi = {
  /**
   * Get all ROMs with filters
   */
  getRoms: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.platform_id) params.append('platform_id', filters.platform_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.favorite) params.append('favorite', 'true');
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await apiClient.get(`/roms?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single ROM by ID
   */
  getRomById: async (id) => {
    const response = await apiClient.get(`/roms/${id}`);
    return response.data;
  },

  /**
   * Get recently added ROMs
   */
  getRecentlyAdded: async (limit = 10) => {
    const response = await apiClient.get(`/roms/recent/added?limit=${limit}`);
    return response.data;
  },

  /**
   * Get recently played ROMs
   */
  getRecentlyPlayed: async (limit = 10) => {
    const response = await apiClient.get(`/roms/recent/played?limit=${limit}`);
    return response.data;
  },

  /**
   * Get favorite ROMs
   */
  getFavorites: async () => {
    const response = await apiClient.get('/roms/favorites');
    return response.data;
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite: async (id) => {
    const response = await apiClient.patch(`/roms/${id}/favorite`);
    return response.data;
  },

  /**
   * Update ROM metadata
   */
  updateRom: async (id, data) => {
    const response = await apiClient.put(`/roms/${id}`, data);
    return response.data;
  },

  /**
   * Delete ROM
   */
  deleteRom: async (id) => {
    const response = await apiClient.delete(`/roms/${id}`);
    return response.data;
  },
};
