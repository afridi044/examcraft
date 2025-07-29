import { apiClient } from '../api-client';

export const analyticsService = {
  /**
   * Get user progress over time for line/area charts
   */
  async getProgressOverTime(dateRange?: { from: string; to: string }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.append('from', dateRange.from);
    if (dateRange?.to) params.append('to', dateRange.to);
    
    const queryString = params.toString();
    const endpoint = `/analytics/progress-over-time${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(endpoint);
  },

  /**
   * Get user activity heatmap data for calendar visualization
   */
  async getActivityHeatmap(year?: number): Promise<any> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    
    const queryString = params.toString();
    const endpoint = `/analytics/activity-heatmap${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(endpoint);
  },

  /**
   * Get accuracy breakdown by question type and difficulty
   */
  async getAccuracyBreakdown(): Promise<any> {
    return apiClient.get('/analytics/accuracy-breakdown');
  },

  /**
   * Get quiz performance trend over time
   */
  async getQuizPerformanceTrend(): Promise<any> {
    return apiClient.get('/analytics/quiz-performance-trend');
  },

  /**
   * Get flashcard mastery distribution and review history
   */
  async getFlashcardAnalytics(): Promise<any> {
    return apiClient.get('/analytics/flashcard-analytics');
  },

  /**
   * Get best and worst performing topics
   */
  async getBestWorstTopics(): Promise<any> {
    return apiClient.get('/analytics/best-worst-topics');
  },

  /**
   * Get detailed topic progress analysis with parent-child relationships
   */
  async getTopicStats(): Promise<any> {
    return apiClient.get('/analytics/topic-stats');
  },

  /**
   * Get comprehensive analytics data (all data in one call)
   */
  async getComprehensiveAnalytics(): Promise<any> {
    return apiClient.get('/analytics/comprehensive');
  },
}; 