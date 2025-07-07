import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { DatabaseService } from '../database/database.service';
import { Logger } from '@nestjs/common';
import type {
  ApiResponse,
  QuestionWithOptions,
  CreateQuestionInput,
  CreateQuestionOptionInput,
} from '../types/shared.types';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let databaseService: jest.Mocked<DatabaseService>;
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: DatabaseService,
          useValue: {
            getQuestionsWithOptions: jest.fn(),
            getQuestionById: jest.fn(),
            createQuestion: jest.fn(),
            createQuestionOption: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    databaseService = module.get(DatabaseService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuestions', () => {
    it('should call db.getQuestionsWithOptions with filters and return result', async () => {
      const filters = { topicId: 't1', difficulty: 2, questionType: 'mcq', limit: 5 };
      const mockQuestions: QuestionWithOptions[] = [
        {
          question_id: 'q1',
          content: 'What is 2+2?',
          question_type: 'mcq',
          difficulty: 1,
          topic_id: 't1',
          created_at: '2024-06-01',
          updated_at: '2024-06-01',
          question_options: [],
        },
      ];
      const mockResponse: ApiResponse<QuestionWithOptions[]> = { success: true, data: mockQuestions, error: null };
      databaseService.getQuestionsWithOptions.mockResolvedValue(mockResponse);
      const result = await service.getQuestions(filters);
      expect(databaseService.getQuestionsWithOptions).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResponse);
    });
    it('should call db.getQuestionsWithOptions with no filters', async () => {
      const mockResponse: ApiResponse<QuestionWithOptions[]> = { success: true, data: [], error: null };
      databaseService.getQuestionsWithOptions.mockResolvedValue(mockResponse);
      const result = await service.getQuestions();
      expect(databaseService.getQuestionsWithOptions).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponse);
    });
    it('should handle error from db', async () => {
      const mockResponse: ApiResponse<QuestionWithOptions[]> = { success: false, data: null, error: 'db error' };
      databaseService.getQuestionsWithOptions.mockResolvedValue(mockResponse);
      const result = await service.getQuestions();
      expect(result.success).toBe(false);
      expect(result.error).toBe('db error');
    });
  });

  describe('getQuestionById', () => {
    it('should call db.getQuestionById and return result', async () => {
      const mockQuestion: QuestionWithOptions = {
        question_id: 'q1',
        content: 'What is 2+2?',
        question_type: 'mcq',
        difficulty: 1,
        topic_id: 't1',
        created_at: '2024-06-01',
        updated_at: '2024-06-01',
        question_options: [],
      };
      const mockResponse: ApiResponse<QuestionWithOptions> = { success: true, data: mockQuestion, error: null };
      databaseService.getQuestionById.mockResolvedValue(mockResponse);
      const result = await service.getQuestionById('q1');
      expect(databaseService.getQuestionById).toHaveBeenCalledWith('q1');
      expect(result).toEqual(mockResponse);
    });
    it('should handle error from db', async () => {
      const mockResponse: ApiResponse<QuestionWithOptions> = { success: false, data: null, error: 'not found' };
      databaseService.getQuestionById.mockResolvedValue(mockResponse);
      const result = await service.getQuestionById('q1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('not found');
    });
  });

  describe('createQuestionWithOptions', () => {
    const questionInput: CreateQuestionInput = {
      content: 'What is 2+2?',
      question_type: 'mcq',
      difficulty: 1,
      topic_id: 't1',
    };
    const optionsInput: Omit<CreateQuestionOptionInput, 'question_id'>[] = [
      { content: '3', is_correct: false },
      { content: '4', is_correct: true },
    ];
    const createdOptions = [
      { option_id: 'o1', content: '3', is_correct: false, question_id: 'q1' },
      { option_id: 'o2', content: '4', is_correct: true, question_id: 'q1' },
    ];
    const createdQuestion = {
      question_id: 'q1',
      content: 'What is 2+2?',
      question_type: 'mcq',
      difficulty: 1,
      topic_id: 't1',
      created_at: '2024-06-01',
      updated_at: '2024-06-01',
    };

    it('should create question and all options successfully', async () => {
      databaseService.createQuestion.mockResolvedValue({ success: true, data: createdQuestion, error: null });
      databaseService.createQuestionOption
        .mockResolvedValueOnce({ success: true, data: createdOptions[0], error: null })
        .mockResolvedValueOnce({ success: true, data: createdOptions[1], error: null });
      const result = await service.createQuestionWithOptions(questionInput, optionsInput as any);
      expect(databaseService.createQuestion).toHaveBeenCalledWith(questionInput);
      expect(databaseService.createQuestionOption).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.data?.question_id).toBe('q1');
      expect(result.data?.question_options).toHaveLength(2);
    });

    it('should handle question creation failure', async () => {
      databaseService.createQuestion.mockResolvedValue({ success: false, data: null, error: 'invalid' });
      const result = await service.createQuestionWithOptions(questionInput, optionsInput as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid');
      expect(databaseService.createQuestionOption).not.toHaveBeenCalled();
    });

    it('should handle option creation failure', async () => {
      databaseService.createQuestion.mockResolvedValue({ success: true, data: createdQuestion, error: null });
      databaseService.createQuestionOption
        .mockResolvedValueOnce({ success: true, data: createdOptions[0], error: null })
        .mockResolvedValueOnce({ success: false, data: null, error: 'option error' });
      const result = await service.createQuestionWithOptions(questionInput, optionsInput as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe('option error');
    });

    it('should handle empty options array', async () => {
      databaseService.createQuestion.mockResolvedValue({ success: true, data: createdQuestion, error: null });
      const result = await service.createQuestionWithOptions(questionInput, []);
      expect(databaseService.createQuestion).toHaveBeenCalledWith(questionInput);
      expect(databaseService.createQuestionOption).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.question_options).toEqual([]);
    });
  });
}); 