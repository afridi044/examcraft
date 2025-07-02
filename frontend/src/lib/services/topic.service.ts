// Topic Service - Backend API calls
import { apiClient } from '../api-client';
import type { 
  ApiResponse, 
  Topic,
  CreateTopicInput,
  TopicWithProgress
} from '@/types';

export const topicService = {
  /**
   * Get all topics
   */
  async getAllTopics(): Promise<ApiResponse<Topic[]>> {
    return apiClient.get<Topic[]>('/topics');
  },

  /**
   * Get topic by ID
   */
  async getTopicById(topicId: string): Promise<ApiResponse<Topic>> {
    return apiClient.get<Topic>(`/topics/${topicId}`);
  },

  /**
   * Create new topic
   */
  async createTopic(input: CreateTopicInput): Promise<ApiResponse<Topic>> {
    return apiClient.post<Topic>('/topics', input);
  },

  /**
   * Update topic
   */
  async updateTopic(topicId: string, input: Partial<CreateTopicInput>): Promise<ApiResponse<Topic>> {
    return apiClient.patch<Topic>(`/topics/${topicId}`, input);
  },

  /**
   * Delete topic
   */
  async deleteTopic(topicId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/topics/${topicId}`);
  },

  /**
   * Get topics with user progress (uses dashboard service)
   */
  async getTopicsWithProgress(userId: string): Promise<ApiResponse<TopicWithProgress[]>> {
    // This might need to be implemented in the backend or use dashboard endpoint
    return apiClient.get<TopicWithProgress[]>(`/dashboard/progress/${userId}`);
  },
}; 
