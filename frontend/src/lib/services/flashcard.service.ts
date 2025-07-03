// Flashcard Service - Backend API calls
import { apiClient } from '../api-client';
import type { 
  ApiResponse, 
  Flashcard,
  FlashcardWithTopic,
  CreateFlashcardInput,
  UpdateFlashcardInput
} from '@/types';

export const flashcardService = {
  /**
   * Create a new flashcard
   */
  async createFlashcard(input: CreateFlashcardInput): Promise<ApiResponse<Flashcard>> {
    return apiClient.post<Flashcard>('/flashcards', input);
  },

  /**
   * Generate AI flashcards for a topic
   */
  async generateAIFlashcards(input: {
    topic: string;
    count: number;
    userId: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    topicId?: string;
  }): Promise<ApiResponse<{
    flashcards: Flashcard[];
    topic_id?: string;
    topic_name: string;
    generated_count: number;
    requested_count: number;
    errors?: string[];
    message: string;
  }>> {
    // Convert frontend parameters to backend DTO format
    const difficultyMap = { 'easy': 1, 'medium': 3, 'hard': 5 };
    const backendPayload = {
      user_id: input.userId,
      topic_id: input.topicId,
      topic_name: input.topic,
      num_flashcards: input.count,
      difficulty: difficultyMap[input.difficulty || 'medium'],
    };
    return apiClient.post<{
      flashcards: Flashcard[];
      topic_id?: string;
      topic_name: string;
      generated_count: number;
      requested_count: number;
      errors?: string[];
      message: string;
    }>('/flashcards/generate-ai', backendPayload);
  },

  /**
   * Create flashcard from existing question
   */
  async createFromQuestion(input: {
    questionId: string;
    userId: string;
    topicId?: string;
  }): Promise<ApiResponse<Flashcard>> {
    // Convert camelCase to snake_case for backend API
    const backendPayload = {
      question_id: input.questionId,
      user_id: input.userId,
      topic_id: input.topicId,
    };
    return apiClient.post<Flashcard>('/flashcards/generate-from-question', backendPayload);
  },

  /**
   * Get user's flashcards
   */
  async getUserFlashcards(userId: string): Promise<ApiResponse<FlashcardWithTopic[]>> {
    return apiClient.get<FlashcardWithTopic[]>(`/flashcards/user/${userId}`);
  },

  /**
   * Get due flashcards for review
   */
  async getDueFlashcards(userId: string): Promise<ApiResponse<FlashcardWithTopic[]>> {
    return apiClient.get<FlashcardWithTopic[]>(`/flashcards/due/${userId}`);
  },

  /**
   * Check if flashcard exists for a question
   */
  async checkFlashcardExists(userId: string, questionId: string): Promise<ApiResponse<{ exists: boolean }>> {
    return apiClient.get<{ exists: boolean }>(`/flashcards/exists/${userId}/${questionId}`);
  },

  /**
   * Batch check if flashcards exist for multiple questions
   */
  async checkFlashcardsExistBatch(input: {
    userId: string;
    questionIds: string[];
  }): Promise<ApiResponse<{ [questionId: string]: boolean }>> {
    // Convert camelCase to snake_case for backend API
    const backendPayload = {
      user_id: input.userId,
      question_ids: input.questionIds,
    };
    return apiClient.post<{ [questionId: string]: boolean }>('/flashcards/exists-batch', backendPayload);
  },

  /**
   * Start a study session
   */
  async startStudySession(input: {
    userId: string;
    topicId: string; // Required by backend
    sessionType: 'learning' | 'under_review' | 'mastered' | 'all' | 'mixed';
  }): Promise<ApiResponse<{
    session: {
      session_id: string;
      topic_id: string;
      topic_name: string;
      total_cards: number;
      mastery_status: string;
      cards: FlashcardWithTopic[];
    };
    fallback?: boolean;
    message?: string;
  }>> {
    // Convert camelCase to snake_case for backend API
    const backendPayload = {
      user_id: input.userId,
      topic_id: input.topicId,
      mastery_status: input.sessionType,
    };
    return apiClient.post<{
      session: {
        session_id: string;
        topic_id: string;
        topic_name: string;
        total_cards: number;
        mastery_status: string;
        cards: FlashcardWithTopic[];
      };
      fallback?: boolean;
      message?: string;
    }>('/flashcards/study-session', backendPayload);
  },

  /**
   * Update flashcard progress
   */
  async updateProgress(input: {
    flashcardId: string;
    quality: number;
    timeSpent: number;
  }): Promise<ApiResponse<{
    flashcard_id: string;
    performance: string;
    mastery_status: string;
    consecutive_correct: number;
    message: string;
    invalidate_cache: boolean;
  }>> {
    // Convert frontend parameters to backend DTO format
    // Use quality >= 3 as threshold for "know" vs "dont_know"
    const performance = input.quality >= 3 ? 'know' : 'dont_know';
    
    const backendPayload = {
      flashcard_id: input.flashcardId,
      performance: performance,
      study_time_seconds: input.timeSpent,
    };
    
    console.log('📊 Sending progress update:', {
      flashcardId: input.flashcardId,
      quality: input.quality,
      performance: performance,
      timeSpent: input.timeSpent
    });
    
    return apiClient.post<{
      flashcard_id: string;
      performance: string;
      mastery_status: string;
      consecutive_correct: number;
      message: string;
      invalidate_cache: boolean;
    }>('/flashcards/update-progress', backendPayload);
  },

  /**
   * Update a flashcard
   */
  async updateFlashcard(flashcardId: string, input: UpdateFlashcardInput): Promise<ApiResponse<Flashcard>> {
    return apiClient.patch<Flashcard>(`/flashcards/${flashcardId}`, input);
  },

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(flashcardId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/flashcards/${flashcardId}`);
  },
}; 