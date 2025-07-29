import { QuizDatabaseService } from '../services/quiz-database.service';
import { TABLE_NAMES } from '../../types/shared.types';



describe('QuizDatabaseService', () => {
  let service: QuizDatabaseService;
  let supabase: any;
  let supabaseAdmin: any;
  let mockLogger: any;
  let mockConfigService: any;

  beforeEach(() => {
    supabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockReturnThis(),
    };
    supabaseAdmin = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
    };
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    mockConfigService = { get: jest.fn() };
    service = new QuizDatabaseService(mockConfigService as any);
    (service as any).supabase = supabase;
    (service as any).supabaseAdmin = supabaseAdmin;
    (service as any).logger = mockLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserQuizzes', () => {
    it('should return user quizzes successfully', async () => {
      const userId = 'user-123';
      const mockQuizzes = [
        { quiz_id: 'quiz-1', title: 'Test Quiz 1' },
        { quiz_id: 'quiz-2', title: 'Test Quiz 2' },
      ];

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: mockQuizzes,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getUserQuizzes(userId);

      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.QUIZZES);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuizzes);
    });

    it('should handle database error', async () => {
      const userId = 'user-123';
      const mockError = { message: 'Database error' };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getUserQuizzes(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const userId = 'user-123';

      supabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.getUserQuizzes(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUserQuizAttempts', () => {
    it('should return quiz attempts successfully', async () => {
      const userId = 'user-123';
      const mockQuizzes = [
        {
          quiz_id: 'quiz-1',
          title: 'Test Quiz 1',
          description: 'Test Description 1',
          created_at: '2023-01-01T00:00:00Z',
          topics: { name: 'Test Topic 1' },
        },
        {
          quiz_id: 'quiz-2',
          title: 'Test Quiz 2',
          description: 'Test Description 2',
          created_at: '2023-01-02T00:00:00Z',
          topics: { name: 'Test Topic 2' },
        },
      ];

      const mockCompletions = [
        {
          quiz_id: 'quiz-1',
          completed_at: '2023-01-01T01:00:00Z',
          total_questions: 10,
          answered_questions: 10,
          correct_answers: 8,
          score_percentage: 80,
          time_spent_minutes: 15,
        },
      ];

      // Mock quizzes query
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: mockQuizzes,
              error: null,
            }),
          }),
        }),
      });

      // Mock completions query
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            data: mockCompletions,
            error: null,
          }),
        }),
      });

      const result = await service.getUserQuizAttempts(userId);

      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.QUIZZES);
      expect(supabase.from).toHaveBeenCalledWith('quiz_completions');
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📊 Getting quiz attempts for user: ${userId}`
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `✅ Retrieved ${mockQuizzes.length} quiz attempts`
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      
      // Check that completed quiz has correct data
      const completedQuiz = result.data.find(q => q.quiz_id === 'quiz-1');
      expect(completedQuiz?.status).toBe('completed');
      expect(completedQuiz?.score_percentage).toBe(80);
      
      // Check that non-completed quiz has correct data
      const nonCompletedQuiz = result.data.find(q => q.quiz_id === 'quiz-2');
      expect(nonCompletedQuiz?.status).toBe('not_taken');
      expect(nonCompletedQuiz?.score_percentage).toBe(0);
    });

    it('should handle database error', async () => {
      const userId = 'user-123';
      const mockError = { message: 'Database error' };

      // Mock quizzes query with error
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getUserQuizAttempts(userId);

      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Error fetching quizzes:',
        mockError
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const userId = 'user-123';

      supabase.rpc.mockRejectedValueOnce(new Error('Unexpected error'));

      const result = await service.getUserQuizAttempts(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getQuizWithQuestions', () => {
    it('should return quiz with questions successfully', async () => {
      const quizId = 'quiz-123';
      const mockQuiz = {
        quiz_id: quizId,
        title: 'Test Quiz',
        topics: { topic_id: 'topic-1', name: 'Test Topic' },
      };
      const mockQuestions = [
        {
          question_id: 'q1',
          text: 'Question 1',
          question_options: [{ option_id: 'opt1', text: 'Option 1' }],
          explanations: [{ explanation_id: 'exp1', text: 'Explanation 1' }],
        },
      ];

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockQuiz,
              error: null,
            }),
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: mockQuestions,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getQuizWithQuestions(quizId);

      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.QUIZZES);
      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.QUESTIONS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...mockQuiz,
        questions: mockQuestions,
      });
    });

    it('should handle quiz fetch error', async () => {
      const quizId = 'quiz-123';
      const mockError = { message: 'Quiz not found' };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getQuizWithQuestions(quizId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle questions fetch error', async () => {
      const quizId = 'quiz-123';
      const mockQuiz = { quiz_id: quizId, title: 'Test Quiz' };
      const mockError = { message: 'Questions fetch error' };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockQuiz,
              error: null,
            }),
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getQuizWithQuestions(quizId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('createQuiz', () => {
    it('should create quiz successfully', async () => {
      const quizInput = {
        title: 'New Quiz',
        description: 'Test description',
        user_id: 'user-123',
      };
      const mockCreatedQuiz = {
        quiz_id: 'quiz-123',
        ...quizInput,
        created_at: '2024-01-01T00:00:00Z',
      };

      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockCreatedQuiz,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createQuiz(quizInput);

      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.QUIZZES);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedQuiz);
    });

    it('should handle database error', async () => {
      const quizInput = { title: 'New Quiz', user_id: 'user-123' };
      const mockError = { message: 'Insert failed' };

      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.createQuiz(quizInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('submitAnswer', () => {
    it('should submit answer successfully with quiz_id', async () => {
      const answerInput = {
        user_id: 'user-123',
        question_id: 'q1',
        quiz_id: 'quiz-123',
        selected_option_id: 'opt1',
        is_correct: true,
      };
      const mockSubmittedAnswer = { ...answerInput, answer_id: 'ans-123' };

      // Mock the delete operation using the same pattern as exam database service
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              eq: jest.fn().mockResolvedValueOnce({ error: null }),
            }),
          }),
        }),
      });

      // Mock the insert operation
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockSubmittedAnswer,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.submitAnswer(answerInput);

      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.USER_ANSWERS);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📝 Submitting answer for question: ${answerInput.question_id}`
      );
      expect(mockLogger.log).toHaveBeenCalledWith('✅ Answer submitted successfully');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSubmittedAnswer);
    });

    it('should submit answer successfully without quiz_id', async () => {
      const answerInput = {
        user_id: 'user-123',
        question_id: 'q1',
        selected_option_id: 'opt1',
        is_correct: true,
      };
      const mockSubmittedAnswer = { ...answerInput, answer_id: 'ans-123' };

      // Mock the delete operation - only two .eq() calls when no quiz_id
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockResolvedValueOnce({ error: null }),
          }),
        }),
      });

      // Mock the insert operation
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockSubmittedAnswer,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.submitAnswer(answerInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSubmittedAnswer);
    });

    it('should handle delete previous answer error', async () => {
      const answerInput = {
        user_id: 'user-123',
        question_id: 'q1',
        quiz_id: 'quiz-123',
        selected_option_id: 'opt1',
      };
      const mockError = { message: 'Delete failed' };

      // Mock the delete operation to throw an error
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              eq: jest.fn().mockImplementation(() => {
                throw new Error('Delete failed');
              }),
            }),
          }),
        }),
      });

      const result = await service.submitAnswer(answerInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle insert error', async () => {
      const answerInput = {
        user_id: 'user-123',
        question_id: 'q1',
        selected_option_id: 'opt1',
      };
      const mockError = { message: 'Insert failed' };

      // Mock the delete operation
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockResolvedValueOnce({ error: null }),
          }),
        }),
      });

      // Mock the insert operation with error
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.submitAnswer(answerInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('deleteQuiz', () => {
    it('should delete quiz successfully with all related data', async () => {
      const quizId = 'quiz-123';
      const mockQuestionIds = ['q1', 'q2'];

      // Mock get question IDs
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [
              { question_id: 'q1' },
              { question_id: 'q2' },
            ],
            error: null,
          }),
        }),
      });

      // Mock all delete operations
      supabaseAdmin.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
          in: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await service.deleteQuiz(quizId);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `🗑️ Starting complete cascade deletion of quiz: ${quizId}`
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Found ${mockQuestionIds.length} questions to delete for quiz ${quizId}`
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `✅ Successfully deleted quiz ${quizId} with ALL related data (${mockQuestionIds.length} questions, options, explanations, and answers)`
      );
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle get question IDs error', async () => {
      const quizId = 'quiz-123';
      const mockError = { message: 'Failed to get questions' };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await service.deleteQuiz(quizId);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to get question IDs for quiz ${quizId}:`,
        mockError
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle user answers deletion error', async () => {
      const quizId = 'quiz-123';
      const mockError = { message: 'Failed to delete answers' };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [{ question_id: 'q1' }],
            error: null,
          }),
        }),
      });

      supabaseAdmin.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: mockError }),
        }),
      });

      const result = await service.deleteQuiz(quizId);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to delete user answers for quiz ${quizId}:`,
        mockError
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('addQuestionsToQuiz', () => {
    it('should add questions to quiz successfully', async () => {
      const quizId = 'quiz-123';
      const questionIds = ['q1', 'q2', 'q3'];
      const mockQuizQuestions = [
        { quiz_id: quizId, question_id: 'q1', question_order: 1 },
        { quiz_id: quizId, question_id: 'q2', question_order: 2 },
        { quiz_id: quizId, question_id: 'q3', question_order: 3 },
      ];

      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce({
            data: mockQuizQuestions,
            error: null,
          }),
        }),
      });

      const result = await service.addQuestionsToQuiz(quizId, questionIds);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLE_NAMES.QUIZ_QUESTIONS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuizQuestions);
    });

    it('should return empty array when no question IDs provided', async () => {
      const quizId = 'quiz-123';
      const questionIds: string[] = [];

      const result = await service.addQuestionsToQuiz(quizId, questionIds);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle database error', async () => {
      const quizId = 'quiz-123';
      const questionIds = ['q1', 'q2'];
      const mockError = { message: 'Insert failed' };

      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await service.addQuestionsToQuiz(quizId, questionIds);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateQuiz', () => {
    it('should update quiz successfully', async () => {
      const quizId = 'quiz-123';
      const updateInput = { title: 'Updated Quiz', description: 'New description' };
      const mockUpdatedQuiz = {
        quiz_id: quizId,
        ...updateInput,
        updated_at: '2024-01-01T00:00:00Z',
      };

      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: mockUpdatedQuiz,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateQuiz(quizId, updateInput);

      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.QUIZZES);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedQuiz);
    });

    it('should handle database error', async () => {
      const quizId = 'quiz-123';
      const updateInput = { title: 'Updated Quiz' };
      const mockError = { message: 'Update failed' };

      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateQuiz(quizId, updateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUserAnswers', () => {
    it('should return user answers successfully without filters', async () => {
      const userId = 'user-123';
      const mockAnswers = [
        { answer_id: 'ans1', question_id: 'q1', selected_option_id: 'opt1' },
        { answer_id: 'ans2', question_id: 'q2', selected_option_id: 'opt2' },
      ];

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: mockAnswers,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getUserAnswers(userId);

      expect(supabase.from).toHaveBeenCalledWith(TABLE_NAMES.USER_ANSWERS);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📝 Getting user answers for user: ${userId}`
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnswers);
    });

    it('should return user answers with quiz filter', async () => {
      const userId = 'user-123';
      const filters = { quizId: 'quiz-123' };
      const mockAnswers = [
        { answer_id: 'ans1', question_id: 'q1', quiz_id: 'quiz-123' },
      ];

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: mockAnswers,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.getUserAnswers(userId, filters);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnswers);
    });

    it('should return user answers with session filter', async () => {
      const userId = 'user-123';
      const filters = { sessionId: 'session-123' };
      const mockAnswers = [
        { answer_id: 'ans1', question_id: 'q1', session_id: 'session-123' },
      ];

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: mockAnswers,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.getUserAnswers(userId, filters);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnswers);
    });

    it('should handle database error', async () => {
      const userId = 'user-123';
      const mockError = { message: 'Database error' };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockReturnValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getUserAnswers(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const userId = 'user-123';

      supabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.getUserAnswers(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
}); 