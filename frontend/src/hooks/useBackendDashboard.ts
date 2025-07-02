// Backend-Powered Dashboard Hooks
// These replace direct database operations with backend API calls

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { dashboardService } from "@/lib/services";

// =============================================
// Backend Query Keys (separate namespace)
// =============================================

export const BACKEND_QUERY_KEYS = {
  // Backend dashboard data
  dashboardStats: (userId: string) => ["backend", "dashboard", "stats", userId] as const,
  recentActivity: (userId: string) => ["backend", "dashboard", "activity", userId] as const,
  topicProgress: (userId: string) => ["backend", "dashboard", "progress", userId] as const,
  allDashboardData: (userId: string) => ["backend", "dashboard", "all", userId] as const,
} as const;

// =============================================
// Individual Backend Hooks
// =============================================

export function useBackendDashboardStats(userId: string) {
  return useQuery({
    queryKey: BACKEND_QUERY_KEYS.dashboardStats(userId),
    queryFn: () => dashboardService.getUserStats(userId),
    select: (response) => {
      // API client now properly unwraps backend response
      return response.data || null;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useBackendRecentActivity(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: [...BACKEND_QUERY_KEYS.recentActivity(userId), limit],
    queryFn: () => dashboardService.getRecentActivity(userId),
    select: (response) => {
      // API client now properly unwraps backend response
      const result = Array.isArray(response.data) ? response.data : [];
      return result;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useBackendTopicProgress(userId: string) {
  return useQuery({
    queryKey: BACKEND_QUERY_KEYS.topicProgress(userId),
    queryFn: () => dashboardService.getTopicProgress(userId),
    select: (response) => {
      // API client now properly unwraps backend response
      const result = Array.isArray(response.data) ? response.data : [];
      return result;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}

// =============================================
// Optimized Backend Dashboard Hook
// =============================================

export function useBackendOptimizedDashboard(userId: string) {
  return useQuery({
    queryKey: BACKEND_QUERY_KEYS.allDashboardData(userId),
    queryFn: async () => {
      try {
        const response = await dashboardService.getAllDashboardData(userId);
        return response;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 0, // CHANGED: Force fresh data
    gcTime: 0, // CHANGED: No caching to eliminate cache issues
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    refetchInterval: false,
    select: (response) => {
      // API client now properly unwraps backend response
      const data = response.data;
      return {
        stats: data?.stats || null,
        recentActivity: data?.recentActivity || [],
        topicProgress: data?.topicProgress || [],
      };
    },
  });
}

// =============================================
// Compound Backend Dashboard Hook (Drop-in Replacement)
// =============================================

export function useBackendDashboardData(
  userId: string,
  useOptimized: boolean = true
) {
  // OPTIMIZED VERSION: Single batched call (recommended)
  const optimizedResult = useBackendOptimizedDashboard(userId);

  // LEGACY VERSION: Individual hooks (for backward compatibility)
  const stats = useBackendDashboardStats(userId);
  const recentActivity = useBackendRecentActivity(userId);
  const topicProgress = useBackendTopicProgress(userId);

  // Create a stable empty state object to prevent re-renders
  const emptyState = useMemo(
    () => ({
      stats: { data: null, isLoading: false, isError: false, error: null },
      recentActivity: {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      },
      topicProgress: {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      },
      isLoading: false,
      isError: false,
      error: null,
    }),
    []
  );

  return useMemo(() => {
    // If no userId, return empty state
    if (!userId) {
      return emptyState;
    }

    // Use optimized version (default and recommended)
    if (useOptimized) {
      return {
        stats: {
          data: optimizedResult.data?.stats,
          isLoading: optimizedResult.isLoading,
          isError: optimizedResult.isError,
          error: optimizedResult.error,
        },
        recentActivity: {
          data: optimizedResult.data?.recentActivity || [],
          isLoading: optimizedResult.isLoading,
          isError: optimizedResult.isError,
          error: optimizedResult.error,
        },
        topicProgress: {
          data: optimizedResult.data?.topicProgress || [],
          isLoading: optimizedResult.isLoading,
          isError: optimizedResult.isError,
          error: optimizedResult.error,
        },
        isLoading: optimizedResult.isLoading,
        isError: optimizedResult.isError,
        error: optimizedResult.error,
      };
    }

    // Legacy version: separate hooks
    return {
      stats,
      recentActivity,
      topicProgress,
      isLoading:
        stats.isLoading || recentActivity.isLoading || topicProgress.isLoading,
      isError: stats.isError || recentActivity.isError || topicProgress.isError,
      error: stats.error || recentActivity.error || topicProgress.error,
    };
  }, [
    userId,
    useOptimized,
    optimizedResult,
    stats,
    recentActivity,
    topicProgress,
    emptyState,
  ]);
}

// =============================================
// Backend Cache Management
// =============================================

export function useInvalidateBackendDashboard() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) => {
      // Invalidate all backend dashboard data
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.dashboardStats(userId),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.recentActivity(userId),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.topicProgress(userId),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.allDashboardData(userId),
      });
    },
    [queryClient]
  );
}

