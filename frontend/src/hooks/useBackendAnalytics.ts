import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/lib/services/analytics.service';

// Query keys for analytics operations
export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  progressOverTime: (dateRange?: { from: string; to: string }) => 
    [...ANALYTICS_QUERY_KEYS.all, 'progress-over-time', dateRange] as const,
  activityHeatmap: (year?: number) => 
    [...ANALYTICS_QUERY_KEYS.all, 'activity-heatmap', year] as const,
  accuracyBreakdown: () => 
    [...ANALYTICS_QUERY_KEYS.all, 'accuracy-breakdown'] as const,
  quizPerformanceTrend: () => 
    [...ANALYTICS_QUERY_KEYS.all, 'quiz-performance-trend'] as const,
  flashcardAnalytics: () => 
    [...ANALYTICS_QUERY_KEYS.all, 'flashcard-analytics'] as const,
  bestWorstTopics: () => 
    [...ANALYTICS_QUERY_KEYS.all, 'best-worst-topics'] as const,
  comprehensive: () => 
    [...ANALYTICS_QUERY_KEYS.all, 'comprehensive'] as const,
};

/**
 * Hook to get user progress over time for charts
 */
export function useProgressOverTime(dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.progressOverTime(dateRange),
    queryFn: async () => {
      const response = await analyticsService.getProgressOverTime(dateRange);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch progress data');
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get user activity heatmap data
 */
export function useActivityHeatmap(year?: number) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.activityHeatmap(year),
    queryFn: async () => {
      const response = await analyticsService.getActivityHeatmap(year);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch heatmap data');
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get accuracy breakdown by type and difficulty
 */
export function useAccuracyBreakdown() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.accuracyBreakdown(),
    queryFn: async () => {
      const response = await analyticsService.getAccuracyBreakdown();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch accuracy breakdown');
      }
      return response.data || {};
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get quiz performance trend over time
 */
export function useQuizPerformanceTrend() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.quizPerformanceTrend(),
    queryFn: async () => {
      const response = await analyticsService.getQuizPerformanceTrend();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch quiz performance trend');
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get flashcard analytics
 */
export function useFlashcardAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.flashcardAnalytics(),
    queryFn: async () => {
      const response = await analyticsService.getFlashcardAnalytics();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch flashcard analytics');
      }
      return response.data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get best and worst topics
 */
export function useBestWorstTopics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.bestWorstTopics(),
    queryFn: async () => {
      const response = await analyticsService.getBestWorstTopics();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch best/worst topics');
      }
      return response.data || {};
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get comprehensive analytics data (all data in one call)
 */
export function useComprehensiveAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.comprehensive(),
    queryFn: async () => {
      const response = await analyticsService.getComprehensiveAnalytics();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch comprehensive analytics');
      }
      return response.data || {};
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for comprehensive data)
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchOnMount: true, // Always fetch fresh data on mount
  });
} 