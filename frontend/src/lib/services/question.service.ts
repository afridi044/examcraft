// Question Service - Backend API calls
import { apiClient } from '../api-client';
import type { 
  ApiResponse, 
  Question,
  QuestionWithOptions,
  CreateQuestionInput,
  CreateQuestionOptionInput
} from '@/types';

export const questionService = {
  /**
   * Get questions with optional filters
   */
  async getQuestionsWithOptions(filters?: {
    topicId?: string;
    difficulty?: number;
    questionType?: string;
    limit?: number;
  }): Promise<ApiResponse<QuestionWithOptions[]>> {
    const params = new URLSearchParams();
    if (filters?.topicId) params.append('topic_id', filters.topicId);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty.toString());
    if (filters?.questionType) params.append('question_type', filters.questionType);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = `/questions${params.toString() ? '?' + params.toString() : ''}`;
    return apiClient.get<QuestionWithOptions[]>(url);
  },

  /**
   * Get question by ID
   */
  async getQuestionById(questionId: string): Promise<ApiResponse<QuestionWithOptions>> {
    return apiClient.get<QuestionWithOptions>(`/questions/${questionId}`);
  },

  /**
   * Create new question with options
   */
  async createQuestionWithOptions(
    question: CreateQuestionInput,
    options: CreateQuestionOptionInput[]
  ): Promise<ApiResponse<QuestionWithOptions>> {
    return apiClient.post<QuestionWithOptions>('/questions', {
      question,
      options
    });
  },

  /**
   * Update question
   */
  async updateQuestion(
    questionId: string, 
    input: Partial<CreateQuestionInput>
  ): Promise<ApiResponse<Question>> {
    return apiClient.patch<Question>(`/questions/${questionId}`, input);
  },

  /**
   * Delete question
   */
  async deleteQuestion(questionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/questions/${questionId}`);
  },
}; 
