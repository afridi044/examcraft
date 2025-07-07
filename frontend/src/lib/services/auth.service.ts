// Auth Service - Backend API calls
import { apiClient } from '../api-client';

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name?: string;
  institution?: string;
  field_of_study?: string;
}

export interface AuthUser {
  id: string;
  auth_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string; // Keep for backward compatibility
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  access_token?: string;
  refresh_token?: string;
  message: string;
  error?: string;
}

export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: string;
}

export const authService = {
  /**
   * Sign in user
   */
  async signIn(input: SignInInput): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signin', input);
      
      if (response.success && response.data) {
        // Store JWT tokens if available
        if (response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
        }
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        // API call succeeded, return the auth response
        return response.data;
      } else {
        // API call failed, return error response
        return {
          success: false,
          message: 'Sign in failed',
          error: response.error || 'Authentication failed'
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        message: 'Sign in failed',
        error: errorMessage
      };
    }
  },

  /**
   * Sign up new user
   */
  async signUp(input: SignUpInput): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', input);
      
      if (response.success && response.data) {
        // Store JWT tokens if available
        if (response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
        }
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        // API call succeeded, return the auth response
        return response.data;
      } else {
        // API call failed, return error response
        return {
          success: false,
          message: 'Sign up failed',
          error: response.error || 'Registration failed'
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        message: 'Sign up failed',
        error: errorMessage
      };
    }
  },

  /**
   * Sign out user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signout');
      
      // Clear JWT tokens regardless of response status
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      if (response.success && response.data) {
        // API call succeeded, return the auth response
        return response.data;
      } else {
        // API call failed, return error response
        return {
          success: false,
          message: 'Sign out failed',
          error: response.error || 'Sign out failed'
        };
      }
    } catch (error: unknown) {
      // Clear tokens even on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        message: 'Sign out failed',
        error: errorMessage
      };
    }
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token available',
          error: 'Please sign in again'
        };
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshToken
      });

      if (response.success && response.data) {
        // Store new tokens
        if (response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
        }
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        return response.data;
      } else {
        // Refresh failed, clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('examcraft-user');
        return {
          success: false,
          message: 'Token refresh failed',
          error: response.error || 'Please sign in again'
        };
      }
    } catch (error: unknown) {
      // Refresh failed, clear all tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('examcraft-user');
      
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        message: 'Token refresh failed',
        error: errorMessage
      };
    }
  },

  /**
   * Check if stored token exists
   */
  hasStoredToken(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Check if user is authenticated by validating the stored JWT token
   */
  async validateToken(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      // Call the protected /auth/me endpoint to validate the token
      const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
      
      if (response.success && response.data?.user) {
        return { success: true, user: response.data.user };
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return { success: false, error: 'Invalid token' };
      }
    } catch (error: unknown) {
      // Token validation failed, clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Get stored access token
   */
  getStoredToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  },

  /**
   * Check if the current token is expired or will expire soon
   */
  isTokenExpired(): boolean {
    const token = this.getStoredToken();
    if (!token) return true;

    try {
      // Decode JWT payload (without verification - just to check expiration)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const buffer = 5 * 60 * 1000; // 5 minute buffer

      return expiry - buffer < now;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired if we can't parse
    }
  },

  /**
   * Proactively refresh token if it's about to expire
   */
  async ensureValidToken(): Promise<boolean> {
    if (!this.hasStoredToken()) return false;
    
    if (this.isTokenExpired()) {
      console.log('🔄 Token expiring soon, refreshing proactively...');
      const result = await this.refreshToken();
      return result.success;
    }
    
    return true;
  },
};