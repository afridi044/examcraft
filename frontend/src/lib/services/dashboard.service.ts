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
   * Get user dashboard statistics
   */
  async getUserStats(userId: string): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>(`/dashboard/stats/${userId}`);
  },

  /**
   * Get user's recent activity
   */
  async getRecentActivity(userId: string): Promise<ApiResponse<RecentActivity[]>> {
    return apiClient.get<RecentActivity[]>(`/dashboard/activity/${userId}`);
  },

  /**
   * Get user's topic progress
   */
  async getTopicProgress(userId: string): Promise<ApiResponse<TopicProgress[]>> {
    return apiClient.get<TopicProgress[]>(`/dashboard/progress/${userId}`);
  },

  /**
   * Get all dashboard data in one call
   */
  async getAllDashboardData(userId: string): Promise<ApiResponse<{
    stats: DashboardStats;
    recentActivity: RecentActivity[];
    topicProgress: TopicProgress[];
  }>> {
    console.log('🔍 Dashboard API call info:', {
      userId,
      endpoint: `/dashboard/all/${userId}`,
      fullUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api/v1'}/dashboard/all/${userId}`
    });
    return apiClient.get(`/dashboard/all/${userId}`);
  },
}; 