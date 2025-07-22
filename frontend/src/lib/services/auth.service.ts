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
        // Cookies are automatically set by the backend
        // No need to manually store tokens
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
        // Cookies are automatically set by the backend
        // No need to manually store tokens
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
      
      // Cookies are automatically cleared by the backend
      // No need to manually clear tokens
      
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
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        message: 'Sign out failed',
        error: errorMessage
      };
    }
  },

  /**
   * Refresh access token using refresh token from cookies
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      // Refresh token is automatically sent from cookies
      const response = await apiClient.post<AuthResponse>('/auth/refresh', {});

      if (response.success && response.data) {
        // New tokens are automatically set in cookies by the backend
        return response.data;
      } else {
        // Refresh failed
        return {
          success: false,
          message: 'Token refresh failed',
          error: response.error || 'Please sign in again'
        };
      }
    } catch (error: unknown) {
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
   * Note: With cookies, we can't check this client-side
   * The backend will handle token validation
   */
  hasStoredToken(): boolean {
    // With cookies, we can't check token existence client-side
    // The backend will validate the token from cookies
    return true; // Assume token exists, backend will validate
  },

  /**
   * Check if user is authenticated by validating the token from cookies
   */
  async validateToken(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Call the protected /auth/me endpoint to validate the token from cookies
      const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
      
      if (response.success && response.data?.user) {
        return { success: true, user: response.data.user };
      } else {
        return { success: false, error: 'Invalid token' };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Get stored access token
   * Note: With cookies, we can't access tokens client-side
   */
  getStoredToken(): string | null {
    // With HTTP-only cookies, we can't access tokens client-side
    // This is a security feature
    return null;
  },

  /**
   * Check if the current token is expired or will expire soon
   * Note: With cookies, we can't check this client-side
   */
  isTokenExpired(): boolean {
    // With HTTP-only cookies, we can't access tokens client-side
    // The backend will handle token expiration and refresh
    return false; // Assume not expired, backend will handle
  },

  /**
   * Proactively refresh token if it's about to expire
   * Note: With cookies, the backend handles this automatically
   */
  async ensureValidToken(): Promise<boolean> {
    // With cookies, the backend handles token refresh automatically
    // We just need to make a request and the backend will refresh if needed
    try {
      const response = await apiClient.get('/auth/me');
      return response.success;
    } catch {
      return false;
    }
  },
};