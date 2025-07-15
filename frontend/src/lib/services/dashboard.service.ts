// Dashboard Service - Backend API calls
import { apiClient } from '../api-client';
import type {
  ApiResponse,
  DashboardStats,
  RecentActivity,
  TopicProgress
} from '@/types';

export const dashboardService = {
  /**
   * Get user dashboard statistics - SECURE: Uses JWT token
   */
  async getUserStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>(`/dashboard/stats`);
  },

  /**
   * Get user's recent activity - SECURE: Uses JWT token
   */
  async getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
    return apiClient.get<RecentActivity[]>(`/dashboard/activity`);
  },

  /**
   * Get user's topic progress - SECURE: Uses JWT token
   */
  async getTopicProgress(): Promise<ApiResponse<TopicProgress[]>> {
    return apiClient.get<TopicProgress[]>(`/dashboard/progress`);
  },

  /**
   * Get all dashboard data in one call - SECURE: Uses JWT token
   */
  async getAllDashboardData(): Promise<ApiResponse<{
    stats: DashboardStats;
    recentActivity: RecentActivity[];
    topicProgress: TopicProgress[];
  }>> {
    console.log('🔍 Dashboard API call info:', {
      endpoint: `/dashboard/all`,
      fullUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api/v1'}/dashboard/all`
    });
    return apiClient.get(`/dashboard/all`);
  },

  // =============================================
  // LAB EXAM TEMPLATE SERVICE METHOD - TOPICS
  // =============================================
  // This method fetches topics from the database

  async getLabExamData(filters?: {
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();

    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/dashboard/lab-exam${queryString ? `?${queryString}` : ''}`;

    console.log('🧪 Topics API call info:', {
      endpoint,
      filters,
      fullUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api/v1'}${endpoint}`
    });

    return apiClient.get<any[]>(endpoint);
  },

  // =============================================
  // LAB EXAM TEMPLATE SERVICE METHOD - CREATE TOPIC
  // =============================================
  // This method creates a new topic in the database

  async createLabExamData(topicData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    const endpoint = `/dashboard/lab-exam`;

    console.log('🧪 Create Topic API call info:', {
      endpoint,
      topicData,
      fullUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api/v1'}${endpoint}`
    });

    return apiClient.post<any>(endpoint, topicData);
  },
}; 