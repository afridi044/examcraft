// Backend-Powered Quiz Hooks
// These replace direct frontend API calls with backend service calls

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { quizService } from "@/lib/services";

// =============================================
// Backend Quiz Query Keys
// =============================================

export const BACKEND_QUIZ_KEYS = {
  userAttempts: (userId: string) => ["backend", "quiz", "attempts", userId] as const,
  quizReview: (quizId: string, userId: string) => ["backend", "quiz", "review", quizId, userId] as const,
} as const;

// =============================================
// Backend Quiz Hooks
// =============================================

/**
 * Get user's quiz attempts using backend service
 * Replaces: /api/quiz/user-attempts/${userId}
 */
export function useBackendUserQuizAttempts(userId: string) {
  return useQuery({
    queryKey: BACKEND_QUIZ_KEYS.userAttempts(userId),
    queryFn: () => quizService.getUserAttempts(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Get quiz review data using backend service
 * Replaces: /api/quiz/review/${quizId}?userId=${userId}
 */
export function useBackendQuizReview(quizId: string, userId: string) {
  return useQuery({
    queryKey: BACKEND_QUIZ_KEYS.quizReview(quizId, userId),
    queryFn: () => quizService.getQuizReview(quizId, userId),
    select: (response) => response.data,
    enabled: !!(quizId && userId),
    staleTime: 0, // Always fetch fresh data for quiz reviews
    refetchOnWindowFocus: true, // Refetch when user comes back to window
    refetchOnMount: true, // Always refetch when component mounts
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes only
  });
}



// =============================================
// Backend Quiz Cache Management
// =============================================

export function useInvalidateBackendQuiz() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string, quizId?: string) => {
      // Invalidate user quiz attempts
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUIZ_KEYS.userAttempts(userId),
      });

      // Invalidate specific quiz review if provided
      if (quizId) {
        queryClient.invalidateQueries({
          queryKey: BACKEND_QUIZ_KEYS.quizReview(quizId, userId),
        });
      }
    },
    [queryClient]
  );
} 