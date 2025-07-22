import { apiClient } from '../api-client';
// Note: Types will be properly defined later

export const flashcardService = {
  /**
   * Create a new flashcard
   */
  async createFlashcard(input: any): Promise<any> {
    return apiClient.post('/flashcards', input);
  },

  /**
   * Generate AI flashcards for a topic
   */
  async generateAIFlashcards(input: {
    topic: string;
    count: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    topicId?: string;
  }): Promise<any> {
    // Convert frontend parameters to backend DTO format
    const difficultyMap = { 'easy': 1, 'medium': 3, 'hard': 5 };
    const backendPayload = {
      topic_id: input.topicId,
      topic_name: input.topic,
      num_flashcards: input.count,
      difficulty: difficultyMap[input.difficulty || 'medium'],
    };
    return apiClient.post('/flashcards/generate-ai', backendPayload);
  },

  /**
   * Create flashcard from existing question
   */
  async createFromQuestion(input: {
    questionId: string;
    topicId?: string;
  }): Promise<any> {
    // Convert camelCase to snake_case for backend API
    const backendPayload = {
      question_id: input.questionId,
      topic_id: input.topicId,
    };
    return apiClient.post('/flashcards/generate-from-question', backendPayload);
  },

  /**
   * Get user's flashcards
   */
  async getUserFlashcards(): Promise<any> {
    return apiClient.get('/flashcards/user');
  },

 
  

  /**
   * Get due flashcards for review
   */
  async getDueFlashcards(): Promise<any> {
    return apiClient.get('/flashcards/due');
  },

  /**
   * Check if flashcard exists for a question
   */
  async checkFlashcardExists(questionId: string): Promise<any> {
    return apiClient.get(`/flashcards/exists/${questionId}`);
  },

  /**
   * Batch check if flashcards exist for multiple questions
   */
  async checkFlashcardsExistBatch(input: {
    questionIds: string[];
  }): Promise<any> {
    // Convert camelCase to snake_case for backend API
    const backendPayload = {
      question_ids: input.questionIds,
    };
    return apiClient.post('/flashcards/exists-batch', backendPayload);
  },

  /**
   * Start a study session
   */
  async startStudySession(input: {
    topicId: string; // Required by backend
    sessionType: 'learning' | 'under_review' | 'mastered' | 'all' | 'mixed';
  }): Promise<any> {
    // Convert camelCase to snake_case for backend API
    const backendPayload = {
      topic_id: input.topicId,
      mastery_status: input.sessionType,
    };
    return apiClient.post('/flashcards/study-session', backendPayload);
  },

  /**
   * Update flashcard progress
   */
  async updateProgress(input: {
    flashcardId: string;
    quality: number;
    timeSpent: number;
  }): Promise<any> {
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
    
    return apiClient.post('/flashcards/update-progress', backendPayload);
  },

  /**
   * Update a flashcard
   */
  async updateFlashcard(flashcardId: string, input: any): Promise<any> {
    return apiClient.patch(`/flashcards/${flashcardId}`, input);
  },

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(flashcardId: string): Promise<any> {
    return apiClient.delete(`/flashcards/${flashcardId}`);
  },


  async searchFlashcards(query: string, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (limit) params.append('limit', limit.toString());
    
    return apiClient.get(`/flashcards/search?${params.toString()}`);
  },
  
}; 