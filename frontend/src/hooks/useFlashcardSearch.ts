import { useState, useEffect } from 'react';
import { flashcardService } from '@/lib/services/flashcard.service';
import type { ApiResponse } from '@/types';

interface FlashcardData {
  flashcard_id: string;
  question: string;
  answer: string;
  topic_id: string | null;
  topic?: {
    name: string;
    description: string | null;
  };
  mastery_status: string;
  created_at: string;
  updated_at: string;
}

interface FlashcardSearchFilters {
  query: string;
  limit?: number;
}

export const useFlashcardSearch = (filters: FlashcardSearchFilters) => {
  const [data, setData] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.query || filters.query.trim().length === 0) {
        setData([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response: ApiResponse<FlashcardData[]> = await flashcardService.searchFlashcards(
          filters.query.trim(),
          filters.limit || 50
        );

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to search flashcards');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    
    const timeoutId = setTimeout(fetchData, 900);
    return () => clearTimeout(timeoutId);
  }, [filters.query, filters.limit]);

  const refetch = async () => {
    if (!filters.query || filters.query.trim().length === 0) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: ApiResponse<FlashcardData[]> = await flashcardService.searchFlashcards(
        filters.query.trim(),
        filters.limit || 50
      );

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to search flashcards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}; 