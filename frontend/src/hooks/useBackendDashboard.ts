// Backend-Powered Dashboard Hooks
// These replace direct database operations with backend API calls

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { dashboardService } from "@/lib/services";

// =============================================
// Backend Query Keys (separate namespace)
// =============================================

export const BACKEND_QUERY_KEYS = {
  // Backend dashboard data - JWT secured, no userId needed
  dashboardStats: () => ["backend", "dashboard", "stats"] as const,
  recentActivity: () => ["backend", "dashboard", "activity"] as const,
  topicProgress: () => ["backend", "dashboard", "progress"] as const,
  allDashboardData: () => ["backend", "dashboard", "all"] as const,
} as const;

// =============================================
// Individual Backend Hooks
// =============================================

export function useBackendDashboardStats() {
  return useQuery({
    queryKey: BACKEND_QUERY_KEYS.dashboardStats(),
    queryFn: () => dashboardService.getUserStats(),
    select: (response) => {
      // API client now properly unwraps backend response
      return response.data || null;
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for more responsive updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
    refetchOnMount: true, // Always refetch on mount
    retry: 1,
    refetchInterval: false,
  });
}

export function useBackendRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: [...BACKEND_QUERY_KEYS.recentActivity(), limit],
    queryFn: () => dashboardService.getRecentActivity(),
    select: (response) => {
      // API client now properly unwraps backend response
      const result = Array.isArray(response.data) ? response.data : [];
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for more responsive updates
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
    refetchOnMount: true, // Always refetch on mount
    retry: 1,
    refetchInterval: false,
  });
}

export function useBackendTopicProgress() {
  return useQuery({
    queryKey: BACKEND_QUERY_KEYS.topicProgress(),
    queryFn: () => dashboardService.getTopicProgress(),
    select: (response) => {
      // API client now properly unwraps backend response
      const result = Array.isArray(response.data) ? response.data : [];
      return result;
    },
    staleTime: 60 * 1000, // 1 minute - topic progress changes less frequently
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
    refetchOnMount: true, // Always refetch on mount
    retry: 1,
    refetchInterval: false,
  });
}

// =============================================
// Optimized Backend Dashboard Hook
// =============================================

export function useBackendOptimizedDashboard() {
  return useQuery({
    queryKey: BACKEND_QUERY_KEYS.allDashboardData(),
    queryFn: async () => {
      try {
        const response = await dashboardService.getAllDashboardData();
        return response;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes only
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch on mount
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
  useOptimized: boolean = true
) {
  // OPTIMIZED VERSION: Single batched call (recommended)
  const optimizedResult = useBackendOptimizedDashboard();

  // LEGACY VERSION: Individual hooks (for backward compatibility)
  const stats = useBackendDashboardStats();
  const recentActivity = useBackendRecentActivity();
  const topicProgress = useBackendTopicProgress();

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
    () => {
      // Invalidate all backend dashboard data (JWT-secured, user-agnostic)
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.dashboardStats(),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.recentActivity(),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.topicProgress(),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUERY_KEYS.allDashboardData(),
      });
    },
    [queryClient]
  );
}

