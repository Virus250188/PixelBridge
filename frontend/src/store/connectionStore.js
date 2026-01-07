/**
 * Connection Store
 * Global state for Apple TV connection status
 */

import { create } from 'zustand';
import { retroarchApi } from '../api';

export const useConnectionStore = create((set) => ({
  online: false,
  checking: true,
  device: null,
  url: null,
  error: null,
  lastCheck: null,

  checkConnection: async () => {
    try {
      const result = await retroarchApi.checkStatus();
      set({
        online: result.online,
        checking: false,
        device: result.device,
        url: result.url,
        error: null,
        lastCheck: new Date()
      });
    } catch (error) {
      set({
        online: false,
        checking: false,
        device: null,
        error: error.message,
        lastCheck: new Date()
      });
    }
  },

  setChecking: (checking) => set({ checking }),
}));
