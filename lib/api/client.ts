import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - Show permission error
          console.error('Permission denied:', error.response.data);
          break;

        case 404:
          // Not found — intentionally not logged; callers handle missing resources
          break;

        case 400:
          // Bad request - Validation errors
          console.error('Validation error:', error.response.data);
          break;

        case 500:
        case 502:
        case 503:
          // Server errors
          console.error('Server error:', error.response.data);
          break;

        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// RTK Query base query using axios
import { BaseQueryFn } from '@reduxjs/toolkit/query';

interface BaseQueryArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  params?: any;
}

export const baseQuery: BaseQueryFn<BaseQueryArgs, unknown, unknown> = async ({
  url,
  method = 'GET',
  body,
  params,
}) => {
  try {
    const result = await apiClient({
      url,
      method,
      data: body,
      params,
      // Don't send Content-Type when there's no body — Spring rejects JSON content type on param-only endpoints
      headers: body === undefined ? { 'Content-Type': undefined } : undefined,
    });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};
