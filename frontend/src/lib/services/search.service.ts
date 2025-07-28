import { apiClient } from '../api-client';
import type { ApiResponse } from '@/types';

export interface QuizSearchResult {
  quiz_id: string;
  title: string;
  description?: string;
  topic_name?: string;
  created_at: string;
  has_attempt?: boolean;
  last_attempt_date?: string | null;
}

export interface FlashcardSearchResult {
  flashcard_id: string;
  question: string;
  answer: string;
  topic_name?: string;
  topic_id?: string;
  created_at: string;
  mastery_status?: 'learning' | 'under_review' | 'mastered';
  consecutive_correct?: number;
}

export interface SearchResults {
  quizzes: QuizSearchResult[];
  flashcards: FlashcardSearchResult[];
}

export const searchService = {
  /**
   * Search for quizzes
   */
  async searchQuizzes(query: string): Promise<ApiResponse<QuizSearchResult[]>> {
    return apiClient.get<QuizSearchResult[]>(`/quiz/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Search for flashcards
   */
  async searchFlashcards(query: string): Promise<ApiResponse<FlashcardSearchResult[]>> {
    return apiClient.get<FlashcardSearchResult[]>(`/flashcards/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Search for both quizzes and flashcards
   */
  async searchAll(query: string): Promise<ApiResponse<SearchResults>> {
    const [quizResponse, flashcardResponse] = await Promise.all([
      this.searchQuizzes(query),
      this.searchFlashcards(query),
    ]);

    return {
      success: quizResponse.success && flashcardResponse.success,
      data: {
        quizzes: quizResponse.data || [],
        flashcards: flashcardResponse.data || [],
      },
      error: quizResponse.error || flashcardResponse.error,
    };
  },
}; 