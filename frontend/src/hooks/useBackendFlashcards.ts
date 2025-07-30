import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { flashcardService } from '@/lib/services/flashcard.service';

// Query keys for flashcard operations
export const FLASHCARD_QUERY_KEYS = {
  all: ['flashcards'] as const,
  user: () => [...FLASHCARD_QUERY_KEYS.all, 'user'] as const,
  due: () => [...FLASHCARD_QUERY_KEYS.all, 'due'] as const,
  exists: (questionId: string) => 
    [...FLASHCARD_QUERY_KEYS.all, 'exists', questionId] as const,
  existsBatch: (questionIds: string[]) => 
    [...FLASHCARD_QUERY_KEYS.all, 'exists-batch', questionIds.sort().join(',')] as const,
};

/**
 * Hook to get user's flashcards
 */
export function useUserFlashcards() {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.user(),
    queryFn: async () => {
      const response = await flashcardService.getUserFlashcards();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch flashcards');
      }
      return response.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for real-time updates
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchOnMount: true, // Always fetch fresh data on mount
  });
}

/**
 * Hook to get due flashcards for review
 */
export function useDueFlashcards() {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.due(),
    queryFn: async () => {
      const response = await flashcardService.getDueFlashcards();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch due flashcards');
      }
      return response.data || [];
    },
    staleTime: 0, // Always fetch fresh due flashcards
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchOnMount: true, // Always fetch fresh data on mount
  });
}

/**
 * Hook to check if flashcard exists for a question
 */
export function useFlashcardExists(questionId: string) {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.exists(questionId),
    queryFn: async () => {
      if (!questionId) return { exists: false };
      const response = await flashcardService.checkFlashcardExists(questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to check flashcard existence');
      }
      return response.data || { exists: false };
    },
    enabled: !!questionId,
    staleTime: 10 * 1000, // 10 seconds - quick updates for existence checks
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchOnMount: true, // Always fetch fresh data on mount
  });
}

/**
 * Hook to batch check if flashcards exist for multiple questions
 */
export function useFlashcardsExistBatch(questionIds: string[]) {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.existsBatch(questionIds),
    queryFn: async () => {
      if (questionIds.length === 0) return {};
      const response = await flashcardService.checkFlashcardsExistBatch({
        questionIds
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to check flashcard existence');
      }
      return response.data || {};
    },
    enabled: questionIds.length > 0,
    staleTime: 10 * 1000, // 10 seconds - quick updates for existence checks
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchOnMount: true, // Always fetch fresh data on mount
  });
}

/**
 * Hook to create a flashcard
 */
export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: any) => {
      const response = await flashcardService.createFlashcard(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create flashcard');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate user flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user()
      });
      
      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due()
      });
    },
  });
}

/**
 * Hook to generate AI flashcards
 */
export function useGenerateAIFlashcards() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      topic: string;
      count: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      topicId?: string;
      subtopicName?: string;
    }) => {
      const response = await flashcardService.generateAIFlashcards(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate AI flashcards');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all flashcard queries since we don't have userId anymore
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.all
      });
    },
  });
}

/**
 * Hook to create flashcard from question
 */
export function useCreateFromQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      questionId: string;
      topicId?: string;
    }) => {
      const response = await flashcardService.createFromQuestion(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create flashcard from question');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all flashcard queries since we don't have userId anymore
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.all
      });
    },
  });
}

/**
 * Hook to start a study session
 */
export function useStartStudySession() {
  return useMutation({
    mutationFn: async (input: {
      topicId: string; // Required by backend
      sessionType: 'learning' | 'under_review' | 'mastered' | 'all' | 'mixed';
    }) => {
      const response = await flashcardService.startStudySession(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to start study session');
      }
      return response.data;
    },
  });
}

/**
 * Hook to update flashcard progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      flashcardId: string;
      quality: number;
      timeSpent: number;
    }) => {
      const response = await flashcardService.updateProgress(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update progress');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all flashcard queries to reflect progress changes
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.all
      });
    },
  });
}

/**
 * Hook to update a flashcard
 */
export function useUpdateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ flashcardId, input }: { 
      flashcardId: string; 
      input: any;
    }) => {
      const response = await flashcardService.updateFlashcard(flashcardId, input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update flashcard');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate user flashcards to reflect changes
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user()
      });
      
      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due()
      });
    },
  });
}

/**
 * Hook to delete a flashcard
 */
export function useDeleteFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (flashcardId: string) => {
      const response = await flashcardService.deleteFlashcard(flashcardId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete flashcard');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate user flashcards to reflect deletion
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user()
      });
      
      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due()
      });
    },
  });
}

// =============================================
// Flashcard Cache Management
// =============================================

/**
 * Hook to invalidate flashcard caches for real-time updates
 */
export function useInvalidateFlashcards() {
  const queryClient = useQueryClient();

  return useCallback(
    (options?: { 
      includeExistence?: boolean;
      questionId?: string;
    }) => {
      // Invalidate user flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user(),
      });

      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due(),
      });

      // Optionally invalidate existence checks
      if (options?.includeExistence) {
        if (options.questionId) {
          // Invalidate specific question existence
          queryClient.invalidateQueries({
            queryKey: FLASHCARD_QUERY_KEYS.exists(options.questionId),
          });
        } else {
          // Invalidate all existence checks
          queryClient.invalidateQueries({
            predicate: (query) => {
              const queryKey = query.queryKey;
              return (
                Array.isArray(queryKey) &&
                queryKey[0] === 'flashcards' &&
                queryKey[1] === 'exists'
              );
            },
          });
        }
      }
    },
    [queryClient]
  );
}