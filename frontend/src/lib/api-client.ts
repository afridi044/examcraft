// API Client for Backend Communication
// This replaces direct database operations with HTTP calls to NestJS backend

// Base response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  message?: string;
}

// Dynamic backend URL configuration
const getBackendUrl = (): string => {
  // 1. Check for explicit environment variable
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // 2. Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001/api/v1';
  }

  // 3. Production fallback (your VM IP)
  return 'http://20.198.228.71:5001/api/v1';
};

// Configuration
const API_BASE_URL = getBackendUrl();

console.log('🌐 API Base URL:', API_BASE_URL);

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

      // Get JWT token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      console.log('🔑 Token for request:', token ? `${token.substring(0, 50)}...` : 'No token');

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log('📋 Request config headers:', config.headers);

      const response = await fetch(url, config);

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url
      });

      if (!response.ok) {
        // Handle 401 errors with automatic token refresh
        if (response.status === 401 && endpoint !== '/auth/refresh' && typeof window !== 'undefined') {
          console.log('🔄 Token expired, attempting refresh...');

          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              // Attempt to refresh token
              const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.success && refreshData.access_token) {
                  // Store new tokens
                  localStorage.setItem('access_token', refreshData.access_token);
                  if (refreshData.refresh_token) {
                    localStorage.setItem('refresh_token', refreshData.refresh_token);
                  }

                  console.log('✅ Token refreshed successfully, retrying request...');
                  // Retry the original request with new token
                  const newToken = localStorage.getItem('access_token');
                  const retryConfig: RequestInit = {
                    ...config,
                    headers: {
                      ...config.headers,
                      'Authorization': `Bearer ${newToken}`,
                    },
                  };

                  const retryResponse = await fetch(url, retryConfig);
                  if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    console.log('✅ Retry successful:', retryData);

                    // Handle the response format as before
                    if (retryData.data !== undefined) {
                      return retryData.success ? {
                        data: retryData.data,
                        error: null,
                        success: true,
                      } : {
                        data: null,
                        error: retryData.error || 'Backend operation failed',
                        success: false,
                      };
                    } else {
                      return {
                        data: retryData,
                        error: null,
                        success: true,
                      };
                    }
                  }
                }
              }
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
            }
          }

          // If refresh failed, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('examcraft-user');

          return {
            data: null,
            error: 'Session expired. Please sign in again.',
            success: false,
          };
        }

        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);

        // Handle NestJS error response format
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (errorData.message) {
          // NestJS error format: { statusCode, message, error }
          errorMessage = errorData.message;
        } else if (errorData.error) {
          // Fallback to error field
          errorMessage = errorData.error;
        }

        return {
          data: null,
          error: errorMessage,
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