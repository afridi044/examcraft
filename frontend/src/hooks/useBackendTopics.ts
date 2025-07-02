import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { topicService } from '@/lib/services/topic.service';
import type { 
  Topic, 
  CreateTopicInput, 
  TopicWithProgress 
} from '@/types';

// Query keys for topic operations
export const TOPIC_QUERY_KEYS = {
  all: ['topics'] as const,
  lists: () => [...TOPIC_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...TOPIC_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...TOPIC_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TOPIC_QUERY_KEYS.details(), id] as const,
  progress: (userId: string) => [...TOPIC_QUERY_KEYS.all, 'progress', userId] as const,
};

/**
 * Hook to get all topics
 */
export function useBackendTopics() {
  return useQuery({
    queryKey: TOPIC_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await topicService.getAllTopics();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch topics');
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get topic by ID
 */
export function useBackendTopic(topicId: string) {
  return useQuery({
    queryKey: TOPIC_QUERY_KEYS.detail(topicId),
    queryFn: async () => {
      if (!topicId) throw new Error('Topic ID is required');
      const response = await topicService.getTopicById(topicId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch topic');
      }
      return response.data;
    },
    enabled: !!topicId,
  });
}

/**
 * Hook to get topics with user progress
 */
export function useBackendTopicsWithProgress(userId: string) {
  return useQuery({
    queryKey: TOPIC_QUERY_KEYS.progress(userId),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await topicService.getTopicsWithProgress(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch topics with progress');
      }
      return response.data || [];
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds (progress data changes more frequently)
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new topic
 */
export function useCreateBackendTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTopicInput) => {
      const response = await topicService.createTopic(input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create topic');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate topics queries to refetch
      queryClient.invalidateQueries({ queryKey: TOPIC_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update a topic
 */
export function useUpdateBackendTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, input }: { topicId: string; input: Partial<CreateTopicInput> }) => {
      const response = await topicService.updateTopic(topicId, input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update topic');
      }
      return response.data;
    },
    onSuccess: (_, { topicId }) => {
      // Invalidate specific topic and lists
      queryClient.invalidateQueries({ queryKey: TOPIC_QUERY_KEYS.detail(topicId) });
      queryClient.invalidateQueries({ queryKey: TOPIC_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook to delete a topic
 */
export function useDeleteBackendTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const response = await topicService.deleteTopic(topicId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete topic');
      }
      return response.data;
    },
    onSuccess: (_, topicId) => {
      // Remove specific topic and invalidate lists
      queryClient.removeQueries({ queryKey: TOPIC_QUERY_KEYS.detail(topicId) });
      queryClient.invalidateQueries({ queryKey: TOPIC_QUERY_KEYS.lists() });
    },
  });
}


