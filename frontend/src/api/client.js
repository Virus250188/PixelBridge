/**
 * Axios API Client
 * Base configuration for API requests
 */

import axios from 'axios';

// Use current hostname for API requests (works for localhost and IP access)
// In development: http://192.168.x.x:5173 -> http://192.168.x.x:3000/api
// In production (Docker): Same hostname, backend is proxied via nginx
const getApiBaseUrl = () => {
  // Check if environment variable is set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In development, construct URL using current hostname
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:3000/api`;
  }

  // In production (Docker), use relative path (nginx proxies /api to backend)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
