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
  full_name?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  message: string;
  error?: string;
}

export const authService = {
  /**
   * Sign in user
   */
  async signIn(input: SignInInput): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signin', input);
      
      if (response.success && response.data) {
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
}; 