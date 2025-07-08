// API Client for Backend Communication
// This replaces direct database operations with HTTP calls to NestJS backend

import { ApiResponse } from '@/types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://20.198.228.71:5001/api/v1';

console

// HTTP Client with error handling
class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic HTTP methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 API Request:', {
        method: options.method || 'GET',
        url,
        baseURL: this.baseURL,
        endpoint
      });
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      
      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        return {
          data: null,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          success: false,
        };
      }

      // Parse the response - handle both wrapped and direct response formats
      const backendResponse = await response.json() as any;
      console.log('✅ API Success Response:', backendResponse);
      
      // Check if response is wrapped in ApiResponse format (has 'data' field)
      // Dashboard endpoints use ApiResponse<T>, Auth endpoints return data directly
      if (backendResponse.data !== undefined) {
        // Wrapped format: ApiResponse<T> - unwrap it
        if (backendResponse.success) {
          return {
            data: backendResponse.data,
            error: null,
            success: true,
          };
        } else {
          return {
            data: null,
            error: backendResponse.error || 'Backend operation failed',
            success: false,
          };
        }
      } else {
        // Direct format: AuthResponseDto or similar - return as-is
        return {
          data: backendResponse,
          error: null,
          success: true,
        };
      }
    } catch (error) {
      console.error('❌ API Request Failed:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error occurred',
        success: false,
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Singleton instance
export const apiClient = new APIClient();

// Export the class for testing/custom instances
export { APIClient }; 