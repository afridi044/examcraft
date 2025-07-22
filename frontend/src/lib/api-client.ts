// API Client for Backend Communication
// This replaces direct database operations with HTTP calls to NestJS backend

// Base response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  message?: string;
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5001/api/v1' 
    : 'http://20.198.228.71:5001/api/v1');

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

      // With cookies, tokens are automatically sent with requests
      // No need to manually add Authorization header
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies in requests
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
        // Skip token refresh for authentication endpoints (signin, signup, refresh)
        const isAuthEndpoint = endpoint.startsWith('/auth/');
        if (response.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
          console.log('🔄 Token expired, attempting refresh...');

          try {
            // Attempt to refresh token using cookies
            const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include', // Include cookies
            });

            if (refreshResponse.ok) {
              console.log('✅ Token refreshed successfully, retrying request...');
              
              // Retry the original request with new cookies
              const retryResponse = await fetch(url, {
                ...config,
                credentials: 'include', // Include cookies
              });
              
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
          } catch (refreshError) {
            console.log('❌ Token refresh failed:', refreshError);
          }

          return {
            data: null,
            error: 'Session expired. Please sign in again.',
            success: false,
          };
        }

        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        console.log('❌ API Error Response:', errorData);

        // Handle NestJS error response format
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (errorData.message && typeof errorData.message === 'string') {
          // NestJS error format: { statusCode, message, error }
          errorMessage = errorData.message;
        } else if (errorData.error && typeof errorData.error === 'string') {
          // Fallback to error field
          errorMessage = errorData.error;
        }

        // Let the backend's actual error message come through
        // Only override for non-auth endpoints where we know it's a session issue
        if (response.status === 401 && !isAuthEndpoint) {
          errorMessage = 'Session expired. Please sign in again.';
        }

        return {
          data: null,
          error: errorMessage,
          success: false,
        };
      }

      // Parse the response - handle both wrapped and direct response formats
      const backendResponse = await response.json() as Record<string, unknown>;
      console.log('✅ API Success Response:', backendResponse);

      // Check if response is wrapped in ApiResponse format (has 'data' field)
      // Dashboard endpoints use ApiResponse<T>, Auth endpoints return data directly
      if ('data' in backendResponse && backendResponse.data !== undefined) {
        // Wrapped format: ApiResponse<T> - unwrap it
        if (backendResponse.success) {
          return {
            data: backendResponse.data as T,
            error: null,
            success: true,
          };
        } else {
          return {
            data: null,
            error: (backendResponse.error as string) || 'Backend operation failed',
            success: false,
          };
        }
      } else {
        // Direct format: AuthResponseDto or similar - return as-is
        return {
          data: backendResponse as T,
          error: null,
          success: true,
        };
      }
    } catch (error) {
      console.log('❌ API Request Failed:', error);
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

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
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