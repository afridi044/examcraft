// Backend-Powered Quiz Hooks
// These replace direct frontend API calls with backend service calls

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { quizService } from "@/lib/services";
import type { CreateQuizInput } from "@/types";

// =============================================
// Backend Quiz Query Keys
// =============================================

export const BACKEND_QUIZ_KEYS = {
  userAttempts: () => ["backend", "quiz", "attempts"] as const,
  quizReview: (quizId: string) => ["backend", "quiz", "review", quizId] as const,
  quiz: (id: string) => ["backend", "quiz", id] as const,
  quizWithQuestions: (id: string) => ["backend", "quiz", "questions", id] as const,
} as const;

// =============================================
// Backend Quiz Hooks
// =============================================

/**
 * Get user's quiz attempts using backend service - SECURE VERSION
 * Uses JWT token authentication, no userId parameter needed
 */
export function useBackendUserQuizAttempts() {
  return useQuery({
    queryKey: ["backend", "quiz", "attempts"], // Removed userId from key since it's from token
    queryFn: () => quizService.getUserAttempts(), // No userId parameter
    select: (response) => response.data || [],
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
export function useBackendQuizReview(quizId: string) {
  return useQuery({
    queryKey: BACKEND_QUIZ_KEYS.quizReview(quizId),
    queryFn: () => quizService.getQuizReview(quizId),
    select: (response) => response.data,
    enabled: !!quizId,
    staleTime: 0, // Always fetch fresh data for quiz reviews
    refetchOnWindowFocus: true, // Refetch when user comes back to window
    refetchOnMount: true, // Always refetch when component mounts
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes only
  });
}

/**
 * Get quiz with questions using backend service
 * Replaces: useQuizWithQuestions from useDatabase
 */
export function useBackendQuizWithQuestions(quizId: string) {
  return useQuery({
    queryKey: BACKEND_QUIZ_KEYS.quizWithQuestions(quizId),
    queryFn: async () => {
      const response = await quizService.getQuizById(quizId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to get quiz');
      }
      return response.data;
    },
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes - quiz content rarely changes
  });
}

/**
 * Create a new quiz using backend service
 * Replaces: useCreateQuiz from useDatabase
 */
export function useCreateBackendQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuizInput) => {
      const response = await quizService.createQuiz(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create quiz');
      }
      return response.data;
    },
    onSuccess: (_data) => {
      // Invalidate user quiz attempts
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUIZ_KEYS.userAttempts(),
      });
    },
  });
}

/**
 * Delete a quiz using backend service
 * Replaces: useDeleteQuiz from useDatabase
 */
export function useDeleteBackendQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await quizService.deleteQuiz(quizId);
      return response;
    },
    onSuccess: (_result, quizId) => {
      // Invalidate user quiz attempts
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUIZ_KEYS.userAttempts(),
      });
      // Remove specific quiz from cache
      queryClient.removeQueries({
        queryKey: BACKEND_QUIZ_KEYS.quiz(quizId),
      });
      queryClient.removeQueries({
        queryKey: BACKEND_QUIZ_KEYS.quizWithQuestions(quizId),
      });
    },
  });
}

// =============================================
// Backend Quiz Cache Management
// =============================================

export function useInvalidateBackendQuiz() {
  const queryClient = useQueryClient();

  return useCallback(
    (quizId?: string) => {
      // Invalidate user quiz attempts
      queryClient.invalidateQueries({
        queryKey: BACKEND_QUIZ_KEYS.userAttempts(),
      });

      // Invalidate specific quiz review if provided
      if (quizId) {
        queryClient.invalidateQueries({
          queryKey: BACKEND_QUIZ_KEYS.quizReview(quizId),
        });
      }
    },
    [queryClient]
  );
}

/**
 * Granular cache update for flashcard status without full invalidation
 */
export function useUpdateQuizFlashcardStatus() {
  const queryClient = useQueryClient();

  return useCallback(
    (quizId: string, questionId: string, flashcardExists: boolean) => {
      queryClient.setQueryData(
        BACKEND_QUIZ_KEYS.quizReview(quizId),
        (oldData: any) => {
          if (!oldData?.data?.questions) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              questions: oldData.data.questions.map((question: any) =>
                question.question_id === questionId
                  ? { ...question, flashcard_exists: flashcardExists }
                  : question
              ),
            },
          };
        }
      );
    },
    [queryClient]
  );
} 