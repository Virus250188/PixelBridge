/**
 * Upload API Module
 * File upload related API calls
 */

import apiClient from './client';

export const uploadApi = {
  /**
   * Upload ROM files
   */
  uploadRoms: async (files, platformId = null, onProgress = null) => {
    const formData = new FormData();

    // Add files
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Add platform ID if specified
    if (platformId) {
      formData.append('platform_id', platformId);
    }

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  /**
   * Get upload statistics
   */
  getUploadStats: async () => {
    const response = await apiClient.get('/upload/stats');
    return response.data;
  },
};
