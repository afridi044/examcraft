// =============================================
// Database Hooks - Core Operations & Legacy Support
// =============================================
//
// This file provides core operations and maintains compatibility
// with existing components during the migration to specialized hooks.
//
// For new features, prefer specialized hooks:
// - Dashboard: ./useBackendDashboard.ts
// - Quiz Review/Attempts: ./useBackendQuiz.ts  
// - Flashcards: ./useBackendFlashcards.ts
// - Centralized imports: "@/hooks"
// =============================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type {
  CreateQuizInput,
} from "@/types";

// Backend services
import { 
  quizService, 
  userService, 
  topicService,
} from "@/lib/services";

// Auth hook for user authentication
import { useBackendAuth } from "./useBackendAuth";

// =============================================
// Query Keys
// =============================================

export const QUERY_KEYS = {
  // User
  currentUser: ["user", "current"] as const,
  user: (id: string) => ["user", id] as const,

  // Topics
  topics: () => ["topics"] as const,

  // Quizzes
  userQuizzes: (userId: string) => ["quizzes", "user", userId] as const,
  quiz: (id: string) => ["quiz", id] as const,
  quizWithQuestions: (id: string) => ["quiz", "questions", id] as const,
} as const;

// =============================================
// User Hooks
// =============================================

export function useCurrentUser() {
  const { user: authUser } = useBackendAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: async () => {
      if (!authUser?.auth_id) {
        throw new Error('No authenticated user');
      }
      console.log('🔍 Fetching current user for auth_id:', authUser.auth_id);
      const response = await userService.getCurrentUser(authUser.auth_id);
      console.log('📝 Current user response:', response);
      if (!response.success) {
        throw new Error(response.error || 'Failed to get current user');
      }
      return response.data;
    },
    enabled: !!authUser?.auth_id,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data changes infrequently
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 1, // Only retry once to prevent infinite loops
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}

// =============================================
// Topic Hooks
// =============================================

export function useTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.topics(),
    queryFn: async () => {
      const response = await topicService.getAllTopics();
      if (!response.success) {
        throw new Error(response.error || 'Failed to get topics');
      }
      return response.data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - topics don't change often
  });
}

// =============================================
// Quiz CRUD Operations
// Note: For quiz review/attempts, use specialized hooks from useBackendQuiz.ts
// =============================================

export function useQuizWithQuestions(quizId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizWithQuestions(quizId),
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

export function useCreateQuiz() {
  const invalidateUserData = useInvalidateUserData();

  return useMutation({
    mutationFn: async (data: CreateQuizInput) => {
      const response = await quizService.createQuiz(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create quiz');
      }
      return response.data;
    },
    onSuccess: (_data, variables) => {
      invalidateUserData(variables.user_id);
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  const invalidateUserData = useInvalidateUserData();

  return useMutation({
    mutationFn: async ({ quizId, userId }: { quizId: string; userId: string }) => {
      const response = await quizService.deleteQuiz(quizId);
      return { ...response, userId };
    },
    onSuccess: (_result, variables) => {
      const uid = variables.userId;
      invalidateUserData(uid);
      queryClient.invalidateQueries({ queryKey: ["backend", "quiz", "attempts", uid] });
    },
  });
}

// =============================================
// Cache Management
// =============================================

export function useInvalidateUserData() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.currentUser,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.user(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userQuizzes(userId),
      });
      // Also invalidate backend quiz attempts cache for quiz history page
      queryClient.invalidateQueries({
        queryKey: ["backend", "quiz", "attempts", userId],
      });
      // Invalidate flashcard queries for consistency
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "user", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", "due", userId],
      });
    },
    [queryClient]
  );
}




