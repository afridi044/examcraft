import { examService } from '../exam.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('examService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserExams', () => {
    it('fetches user exams successfully', async () => {
      const mockExams = [
        {
          exam_id: 'exam1',
          title: 'JavaScript Fundamentals',
          description: 'Test your JavaScript knowledge',
          duration_minutes: 60,
          total_questions: 20,
          user_id: 'user1',
          topic_id: 'topic1',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          exam_id: 'exam2',
          title: 'React Basics',
          description: 'Test your React knowledge',
          duration_minutes: 45,
          total_questions: 15,
          user_id: 'user1',
          topic_id: 'topic2',
          created_at: '2024-01-02T00:00:00Z'
        }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockExams,
        error: null,
        success: true
      });

      const result = await examService.getUserExams('user1');

      expect(result).toEqual({
        data: mockExams,
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/exams/user');
    });

    it('handles empty exams list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await examService.getUserExams('user1');

      expect(result).toEqual({
        data: [],
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/exams/user');
    });

    it('handles API error response', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch exams',
        success: false
      });

      const result = await examService.getUserExams('user1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch exams');
      expect(result.data).toBeNull();
    });

    it('handles network error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await examService.getUserExams('user1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('getExamWithQuestions', () => {
    it('fetches exam with questions successfully', async () => {
      const mockExamWithQuestions = {
        exam_id: 'exam1',
        title: 'JavaScript Fundamentals',
        description: 'Test your JavaScript knowledge',
        duration_minutes: 60,
        total_questions: 2,
        user_id: 'user1',
        topic_id: 'topic1',
        created_at: '2024-01-01T00:00:00Z',
        exam_questions: [
          {
            exam_question_id: 'eq1',
            exam_id: 'exam1',
            question_id: 'q1',
            order: 1,
            questions: {
              question_id: 'q1',
              content: 'What is JavaScript?',
              question_type: 'multiple-choice',
              difficulty: 1,
              topic_id: 'topic1',
              question_options: [
                { option_id: 'o1', content: 'A programming language', is_correct: true },
                { option_id: 'o2', content: 'A markup language', is_correct: false }
              ]
            }
          }
        ],
        topic: {
          topic_id: 'topic1',
          name: 'JavaScript',
          description: 'JavaScript programming'
        },
        user: {
          user_id: 'user1',
          email: 'user@example.com',
          full_name: 'Test User'
        }
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockExamWithQuestions,
        error: null,
        success: true
      });

      const result = await examService.getExamWithQuestions('exam1');

      expect(result).toEqual({
        data: mockExamWithQuestions,
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/exams/exam1/questions');
    });

    it('handles exam not found error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Exam not found',
        success: false
      });

      const result = await examService.getExamWithQuestions('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Exam not found');
      expect(result.data).toBeNull();
    });

    it('handles network error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await examService.getExamWithQuestions('exam1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('createExam', () => {
    it('creates exam successfully', async () => {
      const mockCreatedExam = {
        exam_id: 'exam1',
        title: 'New JavaScript Exam',
        description: 'A comprehensive JavaScript test',
        duration_minutes: 90,
        total_questions: 25,
        user_id: 'user1',
        topic_id: 'topic1',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockCreatedExam,
        error: null,
        success: true
      });

      const examInput = {
        title: 'New JavaScript Exam',
        description: 'A comprehensive JavaScript test',
        duration_minutes: 90,
        total_questions: 25,
        user_id: 'user1',
        topic_id: 'topic1'
      };

      const result = await examService.createExam(examInput);

      expect(result).toEqual({
        data: mockCreatedExam,
        error: null,
        success: true
      });
      expect(mockedApiClient.post).toHaveBeenCalledWith('/exams', examInput);
    });

    it('handles creation error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Invalid exam data',
        success: false
      });

      const examInput = {
        title: '',
        description: 'A comprehensive JavaScript test',
        duration_minutes: 90,
        total_questions: 25,
        user_id: 'user1',
        topic_id: 'topic1'
      };

      const result = await examService.createExam(examInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid exam data');
      expect(result.data).toBeNull();
    });

    it('handles network error during creation', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const examInput = {
        title: 'New JavaScript Exam',
        description: 'A comprehensive JavaScript test',
        duration_minutes: 90,
        total_questions: 25,
        user_id: 'user1',
        topic_id: 'topic1'
      };

      const result = await examService.createExam(examInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('getUserExamSessions', () => {
    it('fetches user exam sessions successfully', async () => {
      const mockExamSessions = [
        {
          session_id: 'session1',
          exam_id: 'exam1',
          user_id: 'user1',
          start_time: '2024-01-01T10:00:00Z',
          end_time: '2024-01-01T11:00:00Z',
          status: 'completed',
          score: 85,
          total_questions: 20,
          answered_questions: 20,
          correct_answers: 17,
          exams: {
            exam_id: 'exam1',
            title: 'JavaScript Fundamentals',
            description: 'Test your JavaScript knowledge',
            duration_minutes: 60,
            total_questions: 20,
            user_id: 'user1',
            topic_id: 'topic1',
            created_at: '2024-01-01T00:00:00Z',
            exam_questions: [],
            topic: {
              topic_id: 'topic1',
              name: 'JavaScript',
              description: 'JavaScript programming'
            },
            user: {
              user_id: 'user1',
              email: 'user@example.com',
              full_name: 'Test User'
            }
          },
          user: {
            user_id: 'user1',
            email: 'user@example.com',
            full_name: 'Test User'
          },
          user_answers: []
        }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockExamSessions,
        error: null,
        success: true
      });

      const result = await examService.getUserExamSessions('user1');

      expect(result).toEqual({
        data: mockExamSessions,
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/exams/sessions/user');
    });

    it('handles empty sessions list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await examService.getUserExamSessions('user1');

      expect(result).toEqual({
        data: [],
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/exams/sessions/user');
    });

    it('handles API error response', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch exam sessions',
        success: false
      });

      const result = await examService.getUserExamSessions('user1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch exam sessions');
      expect(result.data).toBeNull();
    });

    it('handles network error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await examService.getUserExamSessions('user1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('createExamSession', () => {
    it('creates exam session successfully', async () => {
      const mockCreatedSession = {
        session_id: 'session1',
        exam_id: 'exam1',
        user_id: 'user1',
        start_time: '2024-01-01T10:00:00Z',
        end_time: null,
        status: 'in_progress',
        score: null,
        total_questions: 20,
        answered_questions: 0,
        correct_answers: 0
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockCreatedSession,
        error: null,
        success: true
      });

      const sessionInput = {
        exam_id: 'exam1',
        user_id: 'user1'
      };

      const result = await examService.createExamSession(sessionInput);

      expect(result).toEqual({
        data: mockCreatedSession,
        error: null,
        success: true
      });
      expect(mockedApiClient.post).toHaveBeenCalledWith('/exams/sessions', sessionInput);
    });

    it('handles creation error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Exam not found',
        success: false
      });

      const sessionInput = {
        exam_id: 'nonexistent',
        user_id: 'user1'
      };

      const result = await examService.createExamSession(sessionInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Exam not found');
      expect(result.data).toBeNull();
    });

    it('handles network error during creation', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const sessionInput = {
        exam_id: 'exam1',
        user_id: 'user1'
      };

      const result = await examService.createExamSession(sessionInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('updateExamSession', () => {
    it('updates exam session successfully', async () => {
      const mockUpdatedSession = {
        session_id: 'session1',
        exam_id: 'exam1',
        user_id: 'user1',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        status: 'completed',
        score: 85,
        total_questions: 20,
        answered_questions: 20,
        correct_answers: 17
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockUpdatedSession,
        error: null,
        success: true
      });

      const updateData = {
        end_time: '2024-01-01T11:00:00Z',
        status: 'completed',
        score: 85,
        answered_questions: 20,
        correct_answers: 17
      };

      const result = await examService.updateExamSession('session1', updateData);

      expect(result).toEqual({
        data: mockUpdatedSession,
        error: null,
        success: true
      });
      expect(mockedApiClient.patch).toHaveBeenCalledWith('/exams/sessions/session1', updateData);
    });

    it('handles update error', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'Session not found',
        success: false
      });

      const updateData = {
        status: 'completed'
      };

      const result = await examService.updateExamSession('nonexistent', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Session not found');
      expect(result.data).toBeNull();
    });

    it('handles network error during update', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const updateData = {
        status: 'completed'
      };

      const result = await examService.updateExamSession('session1', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('deleteExam', () => {
    it('deletes exam successfully', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: null,
        success: true
      });

      const result = await examService.deleteExam('exam1');

      expect(result).toEqual({
        data: null,
        error: null,
        success: true
      });
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/exams/exam1');
    });

    it('handles deletion error', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Exam not found',
        success: false
      });

      const result = await examService.deleteExam('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Exam not found');
      expect(result.data).toBeNull();
    });

    it('handles network error during deletion', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await examService.deleteExam('exam1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });
}); 