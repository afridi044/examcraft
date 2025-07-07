import { quizService } from '../quiz.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('quizService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQuiz', () => {
    const input = {
      topic: 'JavaScript',
      difficulty: 'medium' as const,
      questionCount: 5,
      userId: 'user123'
    };

    it('returns quiz data on success', async () => {
      const mockResponse = {
        quiz: {
          id: 'quiz1',
          title: 'JavaScript Quiz',
          questions: []
        },
        questions_created: 5,
        message: 'Quiz generated successfully'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.generateQuiz(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/quiz/generate', {
        title: 'JavaScript Quiz',
        description: 'AI-generated quiz on JavaScript',
        topic_name: 'JavaScript',
        difficulty: 3,
        num_questions: 5,
        question_types: ['multiple-choice'],
        user_id: 'user123'
      });
    });

    it('handles API error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Failed to generate quiz',
        success: false
      });

      const result = await quizService.generateQuiz(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to generate quiz');
    });

    it('handles network error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await quizService.generateQuiz(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getQuizById', () => {
    const quizId = 'quiz123';

    it('returns quiz data on success', async () => {
      const mockResponse = {
        id: quizId,
        title: 'Test Quiz',
        questions: []
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.getQuizById(quizId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/quiz/${quizId}`);
    });

    it('handles 404 error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Quiz not found',
        success: false
      });

      const result = await quizService.getQuizById(quizId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Quiz not found');
    });
  });

  describe('getUserQuizzes', () => {
    const userId = 'user123';

    it('returns user quizzes on success', async () => {
      const mockResponse = [
        { id: 'quiz1', title: 'Quiz 1' },
        { id: 'quiz2', title: 'Quiz 2' }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.getUserQuizzes(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/quiz/user/${userId}`);
    });

    it('handles empty quiz list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await quizService.getUserQuizzes(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getUserAttempts', () => {
    const userId = 'user123';

    it('returns user attempts on success', async () => {
      const mockResponse = [
        { id: 'attempt1', quiz_id: 'quiz1', score: 80 },
        { id: 'attempt2', quiz_id: 'quiz2', score: 90 }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.getUserAttempts(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/quiz/user-attempts/${userId}`);
    });
  });

  describe('submitAnswer', () => {
    const input = {
      userId: 'user123',
      questionId: 'question1',
      selectedOptionId: 'option1',
      isCorrect: true,
      quizId: 'quiz1',
      timeTaken: 30
    };

    it('submits answer successfully', async () => {
      const mockResponse = {
        id: 'answer1',
        user_id: 'user123',
        question_id: 'question1',
        is_correct: true
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.submitAnswer(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/quiz/submit-answer', {
        user_id: 'user123',
        question_id: 'question1',
        selected_option_id: 'option1',
        text_answer: null,
        is_correct: true,
        quiz_id: 'quiz1',
        time_taken_seconds: 30
      });
    });

    it('handles submission error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Invalid answer submission',
        success: false
      });

      const result = await quizService.submitAnswer(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid answer submission');
    });
  });

  describe('getQuizReview', () => {
    const quizId = 'quiz123';
    const userId = 'user123';

    it('returns quiz review data on success', async () => {
      const mockResponse = {
        quiz_id: quizId,
        user_id: userId,
        score: 85,
        total_questions: 10,
        correct_answers: 8
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.getQuizReview(quizId, userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/quiz/review/${quizId}/${userId}`);
    });
  });

  describe('createQuiz', () => {
    const input = {
      title: 'New Quiz',
      description: 'Test quiz',
      topicId: 'topic1',
      difficulty: 3
    };

    it('creates quiz successfully', async () => {
      const mockResponse = {
        id: 'new-quiz',
        title: 'New Quiz',
        description: 'Test quiz'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.createQuiz(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/quiz', input);
    });
  });

  describe('deleteQuiz', () => {
    const quizId = 'quiz123';

    it('deletes quiz successfully', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        error: null,
        success: true
      });

      const result = await quizService.deleteQuiz(quizId);

      expect(result.success).toBe(true);
      expect(mockedApiClient.delete).toHaveBeenCalledWith(`/quiz/${quizId}`);
    });

    it('handles deletion error', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Quiz not found',
        success: false
      });

      const result = await quizService.deleteQuiz(quizId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Quiz not found');
    });
  });

  describe('updateQuiz', () => {
    const quizId = 'quiz123';
    const input = { title: 'Updated Quiz' };

    it('updates quiz successfully', async () => {
      const mockResponse = {
        id: quizId,
        title: 'Updated Quiz'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await quizService.updateQuiz(quizId, input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/quiz/${quizId}`, input);
    });
  });
});
