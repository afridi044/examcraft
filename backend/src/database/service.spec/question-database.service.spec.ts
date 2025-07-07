import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QuestionDatabaseService } from '../services/question-database.service';
import { BaseDatabaseService } from '../services/base-database.service';
import { Logger } from '@nestjs/common';
import type {
  ApiResponse,
  TopicRow,
  QuestionRow,
  QuestionOptionRow,
  ExplanationRow,
  QuestionWithOptions,
  TablesInsert,
  TablesUpdate,
} from '../../types/shared.types';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('QuestionDatabaseService', () => {
  let service: QuestionDatabaseService;
  let supabase: any;
  let supabaseAdmin: any;

  beforeEach(async () => {
    // Create proper chained mocks for both supabase and supabaseAdmin
    const createMockChain = (finalResult: any) => {
      return {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(finalResult),
              }),
              single: jest.fn().mockResolvedValue(finalResult),
              mockResolvedValue: finalResult,
            }),
            single: jest.fn().mockResolvedValue(finalResult),
            mockResolvedValue: finalResult,
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue(finalResult),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue(finalResult),
              }),
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(finalResult),
          }),
          mockResolvedValue: finalResult,
        }),
      };
    };

    supabase = createMockChain({ data: null, error: null });
    supabaseAdmin = createMockChain({ data: null, error: null });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionDatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
      ],
    }).compile();

    service = module.get(QuestionDatabaseService);
    
    // Directly assign to protected properties
    (service as any).supabase = supabase;
    (service as any).supabaseAdmin = supabaseAdmin;
    (service as any).logger = mockLogger;
    
    // Mock protected methods
    jest.spyOn(service as any, 'handleSuccess').mockImplementation((data) => ({ success: true, data, error: null }));
    jest.spyOn(service as any, 'handleError').mockImplementation((err, method) => ({ success: false, data: null, error: String(err) }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTopic', () => {
    it('should create topic successfully', async () => {
      const topicInput: TablesInsert<'topics'> = {
        name: 'Mathematics',
        description: 'Math topics',
      };
      const mockTopic: TopicRow = {
        topic_id: 'topic-1',
        name: 'Mathematics',
        description: 'Math topics',
        parent_topic_id: null,
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockTopic, error: null }),
          }),
        }),
      });

      const result = await service.createTopic(topicInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTopic);
      expect(service['handleSuccess']).toHaveBeenCalledWith(mockTopic);
    });

    it('should handle supabase error', async () => {
      const topicInput: TablesInsert<'topics'> = {
        name: 'Mathematics',
        description: 'Math topics',
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
          }),
        }),
      });

      const result = await service.createTopic(topicInput);
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });

    it('should handle thrown error', async () => {
      const topicInput: TablesInsert<'topics'> = {
        name: 'Mathematics',
        description: 'Math topics',
      };

      supabaseAdmin.from.mockImplementation(() => { throw new Error('boom'); });

      const result = await service.createTopic(topicInput);
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });

  describe('createQuestion', () => {
    it('should create question successfully', async () => {
      const questionInput: TablesInsert<'questions'> = {
        content: 'What is 2+2?',
        question_type: 'multiple_choice',
        difficulty: 1,
        topic_id: 'topic-1',
      };
      const mockQuestion: QuestionRow = {
        question_id: 'q1',
        content: 'What is 2+2?',
        question_type: 'multiple_choice',
        difficulty: 1,
        topic_id: 'topic-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockQuestion, error: null }),
          }),
        }),
      });

      const result = await service.createQuestion(questionInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuestion);
    });

    it('should handle supabase error', async () => {
      const questionInput: TablesInsert<'questions'> = {
        content: 'What is 2+2?',
        question_type: 'multiple_choice',
        difficulty: 1,
        topic_id: 'topic-1',
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
          }),
        }),
      });

      const result = await service.createQuestion(questionInput);
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('createQuestionOption', () => {
    it('should create question option successfully', async () => {
      const optionInput: TablesInsert<'question_options'> = {
        question_id: 'q1',
        content: '4',
        is_correct: true,
      };
      const mockOption: QuestionOptionRow = {
        option_id: 'opt1',
        question_id: 'q1',
        content: '4',
        is_correct: true,
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOption, error: null }),
          }),
        }),
      });

      const result = await service.createQuestionOption(optionInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOption);
    });

    it('should handle supabase error', async () => {
      const optionInput: TablesInsert<'question_options'> = {
        question_id: 'q1',
        content: '4',
        is_correct: true,
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
          }),
        }),
      });

      const result = await service.createQuestionOption(optionInput);
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('createExplanation', () => {
    it('should create explanation successfully', async () => {
      const explanationInput = {
        question_id: 'q1',
        content: '2+2 equals 4 because...',
        ai_generated: false,
      };
      const mockExplanation: ExplanationRow = {
        explanation_id: 'exp1',
        question_id: 'q1',
        content: '2+2 equals 4 because...',
        ai_generated: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockExplanation, error: null }),
          }),
        }),
      });

      const result = await service.createExplanation(explanationInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExplanation);
    });

    it('should handle supabase error', async () => {
      const explanationInput = {
        question_id: 'q1',
        content: '2+2 equals 4 because...',
        ai_generated: false,
      };

      supabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
          }),
        }),
      });

      const result = await service.createExplanation(explanationInput);
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('getQuestionWithCorrectAnswer', () => {
    it('should get question with correct answer successfully', async () => {
      const mockQuestion: QuestionRow = {
        question_id: 'q1',
        content: 'What is 2+2?',
        question_type: 'multiple_choice',
        difficulty: 1,
        topic_id: 'topic-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      const mockOption = { content: '4' };

      // Mock first query (question)
      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockQuestion, error: null }),
            }),
          }),
        })
        // Mock second query (correct option)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockOption, error: null }),
              }),
            }),
          }),
        });

      const result = await service.getQuestionWithCorrectAnswer('q1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ question: mockQuestion, answer: '4' });
    });

    it('should handle question query error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Question not found' }),
          }),
        }),
      });

      const result = await service.getQuestionWithCorrectAnswer('q1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });

    it('should handle option query error', async () => {
      const mockQuestion: QuestionRow = {
        question_id: 'q1',
        content: 'What is 2+2?',
        question_type: 'multiple_choice',
        difficulty: 1,
        topic_id: 'topic-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockQuestion, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: 'Option not found' }),
              }),
            }),
          }),
        });

      const result = await service.getQuestionWithCorrectAnswer('q1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('getQuestionById', () => {
    it('should get question by ID successfully', async () => {
      const mockQuestion = {
        question_id: 'q1',
        content: 'What is 2+2?',
        question_options: [
          { option_id: 'opt1', content: '4', is_correct: true, question_id: 'q1' },
          { option_id: 'opt2', content: '3', is_correct: false, question_id: 'q1' },
        ],
        topic: { topic_id: 'topic-1', name: 'Math', description: null, parent_topic_id: null },
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockQuestion, error: null }),
          }),
        }),
      });

      const result = await service.getQuestionById('q1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuestion);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Question not found' }),
          }),
        }),
      });

      const result = await service.getQuestionById('q1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('getQuestionsWithOptions', () => {
    it('should get questions with options successfully', async () => {
      const mockQuestions: QuestionWithOptions[] = [
        {
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
          topic: { topic_id: 'topic-1', name: 'Math', description: null, parent_topic_id: null },
        },
      ];

      // Create a proper mock chain that returns itself for chaining
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockQuestions, error: null }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await service.getQuestionsWithOptions({ topicId: 'topic-1', limit: 10 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuestions);
    });

    it('should handle supabase error', async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      });

      const result = await service.getQuestionsWithOptions({ topicId: 'topic-1' });
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('boom'); });

      const result = await service.getQuestionsWithOptions();
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });

  describe('getAllTopics', () => {
    it('should get all topics successfully', async () => {
      const mockTopics: TopicRow[] = [
        {
          topic_id: 'topic-1',
          name: 'Mathematics',
          description: 'Math topics',
          parent_topic_id: null,
        },
        {
          topic_id: 'topic-2',
          name: 'Physics',
          description: 'Physics topics',
          parent_topic_id: null,
        },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockTopics, error: null }),
        }),
      });

      const result = await service.getAllTopics();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTopics);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: 'Database error' }),
        }),
      });

      const result = await service.getAllTopics();
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('getTopicById', () => {
    it('should get topic by ID successfully', async () => {
      const mockTopic: TopicRow = {
        topic_id: 'topic-1',
        name: 'Mathematics',
        description: 'Math topics',
        parent_topic_id: null,
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockTopic, error: null }),
          }),
        }),
      });

      const result = await service.getTopicById('topic-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTopic);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: 'Topic not found' }),
          }),
        }),
      });

      const result = await service.getTopicById('topic-1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('updateTopic', () => {
    it('should update topic successfully', async () => {
      const updateInput: TablesUpdate<'topics'> = {
        name: 'Advanced Mathematics',
        description: 'Advanced math topics',
      };
      const mockTopic: TopicRow = {
        topic_id: 'topic-1',
        name: 'Advanced Mathematics',
        description: 'Advanced math topics',
        parent_topic_id: null,
      };

      supabaseAdmin.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockTopic, error: null }),
            }),
          }),
        }),
      });

      const result = await service.updateTopic('topic-1', updateInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTopic);
    });

    it('should handle supabase error', async () => {
      const updateInput: TablesUpdate<'topics'> = {
        name: 'Advanced Mathematics',
      };

      supabaseAdmin.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: 'Update failed' }),
            }),
          }),
        }),
      });

      const result = await service.updateTopic('topic-1', updateInput);
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
  });

  describe('deleteTopic', () => {
    it('should delete topic successfully', async () => {
      supabaseAdmin.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await service.deleteTopic('topic-1');
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should handle supabase error', async () => {
      supabaseAdmin.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: 'Delete failed' }),
        }),
      });

      const result = await service.deleteTopic('topic-1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });

    it('should handle thrown error', async () => {
      supabaseAdmin.from.mockImplementation(() => { throw new Error('boom'); });

      const result = await service.deleteTopic('topic-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });
}); 