import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QuizReviewDatabaseService } from '../services/quiz-review-database.service';
import { BaseDatabaseService } from '../services/base-database.service';
import { Logger } from '@nestjs/common';
import type {
  ApiResponse,
  QuestionRow,
  QuestionOptionRow,
  ExplanationRow,
  UserAnswerRow,
} from '../../types/shared.types';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('QuizReviewDatabaseService', () => {
  let service: QuizReviewDatabaseService;
  let supabase: any;

  beforeEach(async () => {
    // Create a more flexible mock that can handle different query patterns
    supabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            order: jest.fn().mockResolvedValue({ data: null, error: null }),
            in: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
          in: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizReviewDatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
      ],
    }).compile();

    service = module.get(QuizReviewDatabaseService);

    // Directly assign to protected properties
    (service as any).supabase = supabase;
    (service as any).logger = mockLogger;

    // Mock protected methods
    jest.spyOn(service as any, 'handleSuccess').mockImplementation((data) => ({ success: true, data, error: null }));
    jest.spyOn(service as any, 'handleError').mockImplementation((err, method) => ({ success: false, data: null, error: String(err) }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuizReview', () => {
    it('should get quiz review successfully', async () => {
      const mockQuizData = {
        quiz_id: 'quiz-1',
        title: 'Math Quiz',
        description: 'Basic math quiz',
        topic: { name: 'Mathematics' },
        quiz_questions: [
          {
            question_id: 'q1',
            question_order: 1,
            questions: {
              question_id: 'q1',
              content: 'What is 2+2?',
              question_type: 'multiple_choice',
              difficulty: 1,
              topic_id: 'topic-1',
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
              question_options: [
                { option_id: 'opt1', content: '4', is_correct: true, question_id: 'q1' },
                { option_id: 'opt2', content: '3', is_correct: false, question_id: 'q1' },
              ],
            },
          },
        ],
      };

      const mockAnswersData = [
        {
          answer_id: 'ans1',
          question_id: 'q1',
          user_id: 'user-1',
          quiz_id: 'quiz-1',
          selected_option_id: 'opt1',
          text_answer: null,
          is_correct: true,
          time_taken_seconds: 30,
          created_at: '2024-01-01',
        },
      ];

      const mockExplanationsData = [
        {
          explanation_id: 'exp1',
          question_id: 'q1',
          content: '2+2 equals 4 because...',
          ai_generated: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      const mockFlashcardData = [
        { source_question_id: 'q1' },
      ];

      // Create a flexible mock that can handle any query pattern
      const createFlexibleMock = (returnData: any) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(returnData),
            order: jest.fn().mockResolvedValue(returnData),
            in: jest.fn().mockResolvedValue(returnData),
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue(returnData),
            }),
          }),
          in: jest.fn().mockResolvedValue(returnData),
        }),
      });

      // Mock the from method to return different queries based on call order
      supabase.from
        .mockReturnValueOnce(createFlexibleMock({ data: mockQuizData, error: null }))
        .mockReturnValueOnce(createFlexibleMock({ data: mockAnswersData, error: null }))
        .mockReturnValueOnce(createFlexibleMock({ data: mockExplanationsData, error: null }))
        .mockReturnValueOnce(createFlexibleMock({ data: mockFlashcardData, error: null }));

      const result = await service.getQuizReview('quiz-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('quiz');
      expect(result.data).toHaveProperty('questions');
      expect(result.data).toHaveProperty('quiz_stats');
      expect(result.data.quiz.quiz_id).toBe('quiz-1');
      expect(result.data.quiz.title).toBe('Math Quiz');
      expect(result.data.questions).toHaveLength(1);
      expect(result.data.quiz_stats.total_questions).toBe(1);
      expect(result.data.quiz_stats.correct_answers).toBe(1);
      expect(result.data.quiz_stats.percentage).toBe(100);
      expect(service['handleSuccess']).toHaveBeenCalled();
    });

    it('should handle quiz data error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Quiz not found' }),
          }),
        }),
      });

      const result = await service.getQuizReview('quiz-1', 'user-1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });

    it('should handle user answers error', async () => {
      const mockQuizData = {
        quiz_id: 'quiz-1',
        title: 'Math Quiz',
        description: 'Basic math quiz',
        topic: { name: 'Mathematics' },
        quiz_questions: [],
      };

      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockQuizData, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: null, error: 'Answers not found' }),
              }),
            }),
          }),
        });

      const result = await service.getQuizReview('quiz-1', 'user-1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });

    it('should handle explanations error gracefully', async () => {
      const mockQuizData = {
        quiz_id: 'quiz-1',
        title: 'Math Quiz',
        description: 'Basic math quiz',
        topic: { name: 'Mathematics' },
        quiz_questions: [
          {
            question_id: 'q1',
            question_order: 1,
            questions: {
              question_id: 'q1',
              content: 'What is 2+2?',
              question_type: 'multiple_choice',
              difficulty: 1,
              topic_id: 'topic-1',
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
              question_options: [],
            },
          },
        ],
      };

      const mockAnswersData = [];

      const mockFlashcardData = [];

      // Create a flexible mock that can handle any query pattern
      const createFlexibleMock = (returnData: any) => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(returnData),
            order: jest.fn().mockResolvedValue(returnData),
            in: jest.fn().mockResolvedValue(returnData),
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue(returnData),
            }),
          }),
          in: jest.fn().mockResolvedValue(returnData),
        }),
      });

      // Mock the from method to return different queries based on call order
      supabase.from
        .mockReturnValueOnce(createFlexibleMock({ data: mockQuizData, error: null }))
        .mockReturnValueOnce(createFlexibleMock({ data: mockAnswersData, error: null }))
        .mockReturnValueOnce(createFlexibleMock({ data: mockFlashcardData, error: null }))
        .mockReturnValueOnce(createFlexibleMock({ data: null, error: { message: 'Explanations error' } }));

      const result = await service.getQuizReview('quiz-1', 'user-1');

      // Should still succeed even with explanations error
      expect(result.success).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(result.data.questions[0].explanation).toBeUndefined();
    });

    it('should handle topic as array', async () => {
      const mockQuizData = {
        quiz_id: 'quiz-1',
        title: 'Math Quiz',
        description: 'Basic math quiz',
        topic: [{ name: 'Mathematics' }],
        quiz_questions: [],
      };

      const mockAnswersData = [];

      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockQuizData, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockAnswersData, error: null }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        });

      const result = await service.getQuizReview('quiz-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.data.quiz.topic).toEqual({ topic_id: '', name: 'Mathematics' });
    });

    it('should handle null topic', async () => {
      const mockQuizData = {
        quiz_id: 'quiz-1',
        title: 'Math Quiz',
        description: 'Basic math quiz',
        topic: null,
        quiz_questions: [],
      };

      const mockAnswersData = [];

      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockQuizData, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockAnswersData, error: null }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        });

      const result = await service.getQuizReview('quiz-1', 'user-1');

      expect(result.success).toBe(true);
      expect(result.data.quiz.topic).toBeUndefined();
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('boom'); });

      const result = await service.getQuizReview('quiz-1', 'user-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });

  describe('getFlashcardsByUserAndQuestionIds', () => {
    it('should get flashcards successfully', async () => {
      const mockFlashcardData = [
        { source_question_id: 'q1' },
        { source_question_id: 'q2' },
        { source_question_id: null }, // Should be filtered out
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: mockFlashcardData, error: null }),
          }),
        }),
      });

      const result = await service['getFlashcardsByUserAndQuestionIds']('user-1', ['q1', 'q2', 'q3']);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['q1', 'q2']); // null values filtered out
    });

    it('should return empty array for empty question IDs', async () => {
      const result = await service['getFlashcardsByUserAndQuestionIds']('user-1', []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
          }),
        }),
      });

      const result = await service['getFlashcardsByUserAndQuestionIds']('user-1', ['q1']);
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('boom'); });

      const result = await service['getFlashcardsByUserAndQuestionIds']('user-1', ['q1']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });
}); 