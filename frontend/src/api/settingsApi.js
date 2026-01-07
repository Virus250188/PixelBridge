/**
 * Settings API
 * Client for settings endpoints
 */

import apiClient from './client';

export const settingsApi = {
  /**
   * Get all settings
   */
  getSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  /**
   * Get a specific setting
   */
  getSetting: async (key) => {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  /**
   * Update settings
   * @param {Object} settings - Settings to update { retroarch_ip: "192.168.x.x", retroarch_port: "80" }
   */
  updateSettings: async (settings) => {
    const response = await apiClient.put('/settings', settings);
    return response.data;
  },

  /**
   * Delete a setting
   */
  deleteSetting: async (key) => {
    const response = await apiClient.delete(`/settings/${key}`);
    return response.data;
  }
};
