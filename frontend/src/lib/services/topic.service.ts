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
   * Get topics with progress for current user
   */
  async getTopicsWithProgress(): Promise<ApiResponse<TopicWithProgress[]>> {
    // Backend determines user from JWT token
    return apiClient.get<TopicWithProgress[]>('/dashboard/progress');
  },

  /**
   * Get topics with subtopic counts
   */
  async getTopicsWithSubtopicCount(): Promise<ApiResponse<Array<Topic & { subtopic_count: number }>>> {
    return apiClient.get<Array<Topic & { subtopic_count: number }>>('/topics/with-subtopic-count');
  },
}; 
