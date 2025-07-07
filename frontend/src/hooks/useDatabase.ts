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
// - Topics: ./useBackendTopics.ts
// - Centralized imports: "@/hooks"
// =============================================

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

// Backend services
import { 
  userService, 
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




