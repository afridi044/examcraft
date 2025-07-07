// Exam Service - Backend API calls
import { apiClient } from '../api-client';

export const examService = {
  /**
   * Get user's exams
   */
  async getUserExams(): Promise<any> {
    return apiClient.get('/exams/user');
  },

  /**
   * Get exam with questions
   */
  async getExamWithQuestions(examId: string): Promise<any> {
    return apiClient.get(`/exams/${examId}/questions`);
  },

  /**
   * Create new exam
   */
  async createExam(input: any): Promise<any> {
    return apiClient.post('/exams', input);
  },

  /**
   * Generate AI-powered exam
   */
  async generateExam(input: {
    title: string;
    description?: string;
    topicName: string;
    topicId?: string;
    customTopic?: string;
    difficulty: number; // 1-5
    numQuestions: number;
    questionTypes: string[];
    durationMinutes: number;
    passingScore: number;
    contentSource?: string;
    additionalInstructions?: string;
  }): Promise<any> {
    // Convert frontend input to backend GenerateExamDto format
    const backendPayload = {
      title: input.title,
      description: input.description,
      topic_name: input.topicName,
      topic_id: input.topicId,
      custom_topic: input.customTopic,
      difficulty: input.difficulty,
      num_questions: input.numQuestions,
      question_types: input.questionTypes,
      duration_minutes: input.durationMinutes,
      passing_score: input.passingScore,
      content_source: input.contentSource,
      additional_instructions: input.additionalInstructions,
    };
    return apiClient.post('/exams/generate', backendPayload);
  },

  /**
   * Get user's exam sessions
   */
  async getUserExamSessions(): Promise<any> {
    return apiClient.get('/exams/sessions/user');
  },

  /**
   * Create exam session
   */
  async createExamSession(input: any): Promise<any> {
    return apiClient.post('/exams/sessions', input);
  },

  /**
   * Update exam session
   */
  async updateExamSession(
    sessionId: string, 
    input: any
  ): Promise<any> {
    return apiClient.patch(`/exams/sessions/${sessionId}`, input);
  },

  /**
   * Delete exam
   */
  async deleteExam(examId: string): Promise<any> {
    return apiClient.delete(`/exams/${examId}`);
  },
}; 
