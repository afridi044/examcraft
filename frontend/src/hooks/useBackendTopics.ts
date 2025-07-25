import { useQuery } from '@tanstack/react-query';
import { topicService } from '@/lib/services/topic.service';

// Query keys for topic operations
export const TOPIC_QUERY_KEYS = {
  all: ['topics'] as const,
  lists: () => [...TOPIC_QUERY_KEYS.all, 'list'] as const,
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


