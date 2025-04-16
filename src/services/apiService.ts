import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MoodEntry } from '../types';

// Define the base URL based on environment
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.moodtracker.example';

// Set up request timeout
const TIMEOUT = 30000; // 30 seconds

// Define interface for custom error structure
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Custom API client service that abstracts the implementation details
 * of HTTP requests and provides a consistent interface for API calls.
 */
class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;
  
  constructor() {
    // Initialize axios instance with default configs
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Set up request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Set up response interceptor to handle errors consistently
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with an error status code
          const apiError: ApiError = {
            status: error.response.status,
            message: error.response.data?.message || 'An error occurred',
            errors: error.response.data?.errors,
            timestamp: new Date().toISOString(),
          };
          
          // Handle 401 Unauthorized (token expired or invalid)
          if (error.response.status === 401) {
            // Clear token and redirect to login
            this.setAuthToken(null);
            
            // Dispatch a custom event that the app can listen for
            const event = new CustomEvent('auth:unauthorized', {
              detail: { message: 'Your session has expired. Please log in again.' }
            });
            window.dispatchEvent(event);
          }
          
          // Convert to a more readable error format
          return Promise.reject(apiError);
        }
        
        if (error.request) {
          // Request was made but no response received
          return Promise.reject({
            status: 0,
            message: 'No response from server. Please check your internet connection.',
            timestamp: new Date().toISOString(),
          });
        }
        
        // Something else happened in making the request
        return Promise.reject({
          status: 0,
          message: error.message || 'An unknown error occurred',
          timestamp: new Date().toISOString(),
        });
      }
    );
  }
  
  /**
   * Set the authentication token for API requests
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
    
    // Store or remove token from localStorage
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
  
  /**
   * Initialize the API service with the stored token
   */
  public initializeFromStorage(): void {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this.setAuthToken(storedToken);
    }
  }
  
  /**
   * Make a GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Make a POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Make a PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Make a PATCH request
   */
  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Make a DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Upload a file
   */
  public async uploadFile<T>(url: string, file: File, fieldName: string = 'file', additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add any additional form data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    try {
      const response: AxiosResponse<T> = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Initialize with stored token if available
apiService.initializeFromStorage();

export default apiService;

// Specific API endpoints/modules can be organized here

/**
 * Authentication API functions
 */
export const authApi = {
  login: async (email: string, password: string) => {
    return apiService.post<{ token: string; user: any }>('/auth/login', { email, password });
  },
  
  register: async (userData: { username: string; email: string; password: string }) => {
    return apiService.post<{ token: string; user: any }>('/auth/register', userData);
  },
  
  logout: async () => {
    // Clear the token before making the request
    apiService.setAuthToken(null);
    return apiService.post<{ success: boolean }>('/auth/logout');
  },
  
  getProfile: async () => {
    return apiService.get<any>('/auth/profile');
  },
};

/**
 * Mood API functions
 */
export const moodApi = {
  getMoodEntries: async () => {
    return apiService.get<MoodEntry[]>('/moods');
  },
  
  getMoodEntryById: async (id: string) => {
    return apiService.get<MoodEntry>(`/moods/${id}`);
  },
  
  createMoodEntry: async (moodData: Omit<MoodEntry, 'id'>) => {
    return apiService.post<MoodEntry>('/moods', moodData);
  },
  
  updateMoodEntry: async (id: string, moodData: Partial<MoodEntry>) => {
    return apiService.put<MoodEntry>(`/moods/${id}`, moodData);
  },
  
  deleteMoodEntry: async (id: string) => {
    return apiService.delete<{ success: boolean }>(`/moods/${id}`);
  },
  
  getMoodStats: async (startDate?: string, endDate?: string) => {
    let url = '/moods/stats';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return apiService.get<any>(url);
  },
  
  getMoodPredictions: async (days: number = 7) => {
    return apiService.get<any[]>(`/moods/predictions?days=${days}`);
  },
  
  getMoodSuggestions: async (mood?: string) => {
    let url = '/moods/suggestions';
    if (mood) {
      url += `?mood=${encodeURIComponent(mood)}`;
    }
    return apiService.get<any[]>(url);
  },
  
  exportMoodData: async (format: 'json' | 'csv', startDate?: string, endDate?: string) => {
    let url = `/moods/export?format=${format}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    return apiService.get<Blob>(url, { responseType: 'blob' as any });
  },
};

/**
 * User settings API functions
 */
export const settingsApi = {
  getSettings: async () => {
    return apiService.get<any>('/settings');
  },
  
  updateSettings: async (settings: any) => {
    return apiService.put<any>('/settings', settings);
  },
  
  updateTheme: async (theme: string) => {
    return apiService.patch<any>('/settings/theme', { theme });
  },
  
  updateNotificationPreferences: async (preferences: any) => {
    return apiService.patch<any>('/settings/notifications', preferences);
  },
}; 