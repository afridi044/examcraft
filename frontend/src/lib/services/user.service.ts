// User Service - Backend API calls
import { apiClient } from '../api-client';
import type { ApiResponse, User, CreateUserInput, UpdateUserInput } from '@/types';

export const userService = {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(authId?: string): Promise<ApiResponse<User>> {
    const params = authId ? `?authId=${encodeURIComponent(authId)}` : '';
    return apiClient.get<User>(`/users/current${params}`);
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${userId}`);
  },

  /**
   * Create new user
   */
  async createUser(input: CreateUserInput): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/users', input);
  },

  /**
   * Update user
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(`/users/${userId}`, input);
  },
}; 