/**
 * RetroArch API Module
 * All RetroArch-related API calls
 */

import apiClient from './client';

export const retroarchApi = {
  /**
   * Check RetroArch connection status
   */
  checkStatus: async () => {
    const response = await apiClient.get('/retroarch/status');
    return response.data;
  },

  /**
   * Push single ROM to RetroArch
   */
  pushRom: async (romId) => {
    const response = await apiClient.post(`/retroarch/push/${romId}`);
    return response.data;
  },

  /**
   * Push multiple ROMs to RetroArch
   */
  pushMultipleRoms: async (romIds) => {
    const response = await apiClient.post('/retroarch/push-multiple', {
      rom_ids: romIds
    });
    return response.data;
  },

  /**
   * Complete sync workflow: Backup, Clear, Push, Restore
   */
  syncWithRetroArch: async (romIds) => {
    const response = await apiClient.post('/retroarch/sync', {
      rom_ids: romIds
    });
    return response.data;
  },
};
