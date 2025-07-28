// Quiz Service - Backend API calls
import { apiClient } from '../api-client';
import type { 
  ApiResponse, 
  Quiz, 
  QuizWithQuestions,
  CreateQuizInput,
  UserAnswer,
  QuizAttempt,
  QuizReviewData
} from '@/types';

export const quizService = {
  /**
   * Generate a new quiz using AI
   */
  async generateQuiz(input: {
    title?: string;
    description?: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
    topicId?: string;
    customTopic?: string;
    contentSource?: string;
    additionalInstructions?: string;
  }): Promise<any> {
    // Convert frontend input to backend GenerateQuizDto format
    const backendPayload = {
      title: input.title || `${input.topic} Quiz`,
      description: input.description || `AI-generated quiz on ${input.topic}`,
      topic_name: input.topic,
      topic_id: input.topicId,
      custom_topic: input.customTopic,
      difficulty: input.difficulty === 'easy' ? 1 : input.difficulty === 'medium' ? 3 : 5,
      num_questions: input.questionCount,
      question_types: ['multiple-choice'], // Default to multiple choice
      content_source: input.contentSource,
      additional_instructions: input.additionalInstructions,
    };
    return apiClient.post<{
      quiz: QuizWithQuestions;
      questions_created: number;
      message: string;
    }>('/quiz/generate', backendPayload);
  },

  /**
   * Get quiz by ID
   */
  async getQuizById(quizId: string): Promise<ApiResponse<QuizWithQuestions>> {
    return apiClient.get<QuizWithQuestions>(`/quiz/${quizId}`);
  },

  /**
   * Get user's quiz attempts - SECURE: Uses JWT token, no userId parameter
   */
  async getUserAttempts(): Promise<ApiResponse<QuizAttempt[]>> {
    return apiClient.get<QuizAttempt[]>(`/quiz/user-attempts`);
  },

  /**
   * Submit an answer to a quiz question
   */
  async submitAnswer(input: {
    questionId: string;
    selectedOptionId?: string;
    textAnswer?: string;
    isCorrect?: boolean;
    quizId?: string;
    timeTaken?: number;
  }): Promise<ApiResponse<UserAnswer>> {
    // Convert camelCase to snake_case for backend API
    const backendPayload = {
      question_id: input.questionId,
      selected_option_id: input.selectedOptionId || null,
      text_answer: input.textAnswer || null,
      is_correct: typeof input.isCorrect === 'boolean' ? input.isCorrect : null,
      quiz_id: input.quizId || null,
      time_taken_seconds: input.timeTaken || 0,
    };
    return apiClient.post<UserAnswer>('/quiz/submit-answer', backendPayload);
  },

  /**
   * Get quiz review/results
   */
  async getQuizReview(quizId: string): Promise<ApiResponse<QuizReviewData>> {
    return apiClient.get<QuizReviewData>(`/quiz/review/${quizId}`);
  },

  /**
   * Create a new quiz
   */
  async createQuiz(input: CreateQuizInput): Promise<ApiResponse<Quiz>> {
    return apiClient.post<Quiz>('/quiz', input);
  },

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/quiz/${quizId}`);
  },

  /**
   * Update a quiz
   */
  async updateQuiz(quizId: string, input: Partial<CreateQuizInput>): Promise<ApiResponse<Quiz>> {
    return apiClient.patch<Quiz>(`/quiz/${quizId}`, input);
  },
}; 