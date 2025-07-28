// User Service - Backend API calls
import { apiClient } from '../api-client';
import type { ApiResponse, User, CreateUserInput, UpdateUserInput } from '@/types';

export const userService = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  /**
   * Update current user profile
   */
  async updateCurrentUser(input: UpdateUserInput): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<{ user: User }>('/auth/me', input);
    
    // Transform the response to match expected format
    // Backend returns { success: true, user: User }
    // Frontend expects { success: true, data: User }
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.user,
        error: null,
      };
    }
    
    return response;
  },
}; 