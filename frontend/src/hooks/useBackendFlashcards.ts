import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardService } from '@/lib/services/flashcard.service';
import type { 
  FlashcardWithTopic, 
  CreateFlashcardInput, 
  UpdateFlashcardInput 
} from '@/types';

// Query keys for flashcard operations
export const FLASHCARD_QUERY_KEYS = {
  all: ['flashcards'] as const,
  user: (userId: string) => [...FLASHCARD_QUERY_KEYS.all, 'user', userId] as const,
  due: (userId: string) => [...FLASHCARD_QUERY_KEYS.all, 'due', userId] as const,
  exists: (userId: string, questionId: string) => 
    [...FLASHCARD_QUERY_KEYS.all, 'exists', userId, questionId] as const,
  existsBatch: (userId: string, questionIds: string[]) => 
    [...FLASHCARD_QUERY_KEYS.all, 'exists-batch', userId, questionIds.sort().join(',')] as const,
};

/**
 * Hook to get user's flashcards
 */
export function useUserFlashcards(userId: string) {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.user(userId),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await flashcardService.getUserFlashcards(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch flashcards');
      }
      return response.data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get due flashcards for review
 */
export function useDueFlashcards(userId: string) {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.due(userId),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await flashcardService.getDueFlashcards(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch due flashcards');
      }
      return response.data || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if flashcard exists for a question
 */
export function useFlashcardExists(userId: string, questionId: string) {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.exists(userId, questionId),
    queryFn: async () => {
      if (!userId || !questionId) return { exists: false };
      const response = await flashcardService.checkFlashcardExists(userId, questionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to check flashcard existence');
      }
      return response.data || { exists: false };
    },
    enabled: !!userId && !!questionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to batch check if flashcards exist for multiple questions
 */
export function useFlashcardsExistBatch(userId: string, questionIds: string[]) {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.existsBatch(userId, questionIds),
    queryFn: async () => {
      if (!userId || questionIds.length === 0) return {};
      const response = await flashcardService.checkFlashcardsExistBatch({
        userId,
        questionIds
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to check flashcard existence');
      }
      return response.data || {};
    },
    enabled: !!userId && questionIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a flashcard
 */
export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateFlashcardInput) => {
      const response = await flashcardService.createFlashcard(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create flashcard');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate user flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user(variables.user_id)
      });
      
      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due(variables.user_id)
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
      userId: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      topicId?: string;
    }) => {
      const response = await flashcardService.generateAIFlashcards(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate AI flashcards');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate user flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user(variables.userId)
      });
      
      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due(variables.userId)
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
      userId: string;
      topicId?: string;
    }) => {
      const response = await flashcardService.createFromQuestion(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create flashcard from question');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate user flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user(variables.userId)
      });
      
      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due(variables.userId)
      });
      
      // Invalidate existence check for this question
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.exists(variables.userId, variables.questionId)
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
      userId: string;
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
      input: UpdateFlashcardInput;
    }) => {
      const response = await flashcardService.updateFlashcard(flashcardId, input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update flashcard');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate user flashcards to reflect changes
      if (data?.user_id) {
        queryClient.invalidateQueries({
          queryKey: FLASHCARD_QUERY_KEYS.user(data.user_id)
        });
        
        // Invalidate due flashcards
        queryClient.invalidateQueries({
          queryKey: FLASHCARD_QUERY_KEYS.due(data.user_id)
        });
      }
    },
  });
}

/**
 * Hook to delete a flashcard
 */
export function useDeleteFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ flashcardId, userId }: { 
      flashcardId: string; 
      userId: string;
    }) => {
      const response = await flashcardService.deleteFlashcard(flashcardId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete flashcard');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate user flashcards to reflect deletion
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.user(variables.userId)
      });
      
      // Invalidate due flashcards
      queryClient.invalidateQueries({
        queryKey: FLASHCARD_QUERY_KEYS.due(variables.userId)
      });
    },
  });
} 