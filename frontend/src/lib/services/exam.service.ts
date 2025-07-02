// Exam Service - Backend API calls
import { apiClient } from '../api-client';
import type { 
  ApiResponse, 
  Exam,
  ExamWithQuestions,
  ExamSession,
  ExamSessionWithDetails,
  CreateExamInput,
  CreateExamSessionInput,
  UpdateExamSessionInput
} from '@/types';

export const examService = {
  /**
   * Get user's exams
   */
  async getUserExams(userId: string): Promise<ApiResponse<Exam[]>> {
    return apiClient.get<Exam[]>(`/exams/user/${userId}`);
  },

  /**
   * Get exam with questions
   */
  async getExamWithQuestions(examId: string): Promise<ApiResponse<ExamWithQuestions>> {
    return apiClient.get<ExamWithQuestions>(`/exams/${examId}/questions`);
  },

  /**
   * Create new exam
   */
  async createExam(input: CreateExamInput): Promise<ApiResponse<Exam>> {
    return apiClient.post<Exam>('/exams', input);
  },

  /**
   * Get user's exam sessions
   */
  async getUserExamSessions(userId: string): Promise<ApiResponse<ExamSessionWithDetails[]>> {
    return apiClient.get<ExamSessionWithDetails[]>(`/exams/sessions/user/${userId}`);
  },

  /**
   * Create exam session
   */
  async createExamSession(input: CreateExamSessionInput): Promise<ApiResponse<ExamSession>> {
    return apiClient.post<ExamSession>('/exams/sessions', input);
  },

  /**
   * Update exam session
   */
  async updateExamSession(
    sessionId: string, 
    input: UpdateExamSessionInput
  ): Promise<ApiResponse<ExamSession>> {
    return apiClient.patch<ExamSession>(`/exams/sessions/${sessionId}`, input);
  },

  /**
   * Delete exam
   */
  async deleteExam(examId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/exams/${examId}`);
  },
}; 
