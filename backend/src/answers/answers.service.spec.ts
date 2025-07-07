import { Test, TestingModule } from '@nestjs/testing';
import { AnswersService } from './answers.service';
import { DatabaseService } from '../database/database.service';
import { Logger } from '@nestjs/common';
import type { ApiResponse } from '../types/shared.types';
import type { Tables } from '../types/supabase.generated';

type UserAnswerRow = Tables<'user_answers'>;

describe('AnswersService', () => {
  let service: AnswersService;
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
        AnswersService,
        {
          provide: DatabaseService,
          useValue: {
            getUserAnswers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnswersService>(AnswersService);
    databaseService = module.get(DatabaseService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAnswers', () => {
    it('should call databaseService.getUserAnswers with userId and no filters', async () => {
      const userId = 'user-1';
      const mockAnswers: UserAnswerRow[] = [
        {
          answer_id: 'a1',
          user_id: 'user-1',
          question_id: 'q1',
          selected_option_id: 'opt1',
          text_answer: null,
          is_correct: true,
          time_taken_seconds: 30,
          quiz_id: 'quiz-1',
          session_id: null,
          created_at: '2024-06-01',
        },
        {
          answer_id: 'a2',
          user_id: 'user-1',
          question_id: 'q2',
          selected_option_id: 'opt3',
          text_answer: null,
          is_correct: false,
          time_taken_seconds: 45,
          quiz_id: 'quiz-1',
          session_id: null,
          created_at: '2024-06-01',
        },
      ];
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: true, data: mockAnswers, error: null };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId);
      expect(databaseService.getUserAnswers).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`Fetching answers for user ${userId}`);
    });

    it('should call databaseService.getUserAnswers with userId and quiz filter', async () => {
      const userId = 'user-1';
      const filters = { quizId: 'quiz-1' };
      const mockAnswers: UserAnswerRow[] = [
        {
          answer_id: 'a1',
          user_id: 'user-1',
          question_id: 'q1',
          selected_option_id: 'opt1',
          text_answer: null,
          is_correct: true,
          time_taken_seconds: 30,
          quiz_id: 'quiz-1',
          session_id: null,
          created_at: '2024-06-01',
        },
      ];
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: true, data: mockAnswers, error: null };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId, filters);
      expect(databaseService.getUserAnswers).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`Fetching answers for user ${userId}`);
    });

    it('should call databaseService.getUserAnswers with userId and session filter', async () => {
      const userId = 'user-1';
      const filters = { sessionId: 'session-1' };
      const mockAnswers: UserAnswerRow[] = [
        {
          answer_id: 'a1',
          user_id: 'user-1',
          question_id: 'q1',
          selected_option_id: 'opt1',
          text_answer: null,
          is_correct: true,
          time_taken_seconds: 30,
          quiz_id: null,
          session_id: 'session-1',
          created_at: '2024-06-01',
        },
      ];
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: true, data: mockAnswers, error: null };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId, filters);
      expect(databaseService.getUserAnswers).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`Fetching answers for user ${userId}`);
    });

    it('should call databaseService.getUserAnswers with userId and topic filter', async () => {
      const userId = 'user-1';
      const filters = { topicId: 'topic-1' };
      const mockAnswers: UserAnswerRow[] = [
        {
          answer_id: 'a1',
          user_id: 'user-1',
          question_id: 'q1',
          selected_option_id: 'opt1',
          text_answer: null,
          is_correct: true,
          time_taken_seconds: 30,
          quiz_id: 'quiz-1',
          session_id: null,
          created_at: '2024-06-01',
        },
      ];
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: true, data: mockAnswers, error: null };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId, filters);
      expect(databaseService.getUserAnswers).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`Fetching answers for user ${userId}`);
    });

    it('should call databaseService.getUserAnswers with userId and multiple filters', async () => {
      const userId = 'user-1';
      const filters = { quizId: 'quiz-1', sessionId: 'session-1', topicId: 'topic-1' };
      const mockAnswers: UserAnswerRow[] = [
        {
          answer_id: 'a1',
          user_id: 'user-1',
          question_id: 'q1',
          selected_option_id: 'opt1',
          text_answer: null,
          is_correct: true,
          time_taken_seconds: 30,
          quiz_id: 'quiz-1',
          session_id: 'session-1',
          created_at: '2024-06-01',
        },
      ];
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: true, data: mockAnswers, error: null };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId, filters);
      expect(databaseService.getUserAnswers).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`Fetching answers for user ${userId}`);
    });

    it('should handle empty answers list', async () => {
      const userId = 'user-1';
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: true, data: [], error: null };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(mockLogger.log).toHaveBeenCalledWith(`Fetching answers for user ${userId}`);
    });

    it('should handle error from databaseService', async () => {
      const userId = 'user-1';
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: false, data: null, error: 'Database error' };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(mockLogger.log).toHaveBeenCalledWith(`Fetching answers for user ${userId}`);
    });

    it('should handle text answers (not just multiple choice)', async () => {
      const userId = 'user-1';
      const mockAnswers: UserAnswerRow[] = [
        {
          answer_id: 'a1',
          user_id: 'user-1',
          question_id: 'q1',
          selected_option_id: null,
          text_answer: 'The answer is 4',
          is_correct: true,
          time_taken_seconds: 60,
          quiz_id: 'quiz-1',
          session_id: null,
          created_at: '2024-06-01',
        },
      ];
      const mockResponse: ApiResponse<UserAnswerRow[]> = { success: true, data: mockAnswers, error: null };
      databaseService.getUserAnswers.mockResolvedValue(mockResponse);
      const result = await service.getUserAnswers(userId);
      expect(result.success).toBe(true);
      expect(result.data?.[0].text_answer).toBe('The answer is 4');
      expect(result.data?.[0].selected_option_id).toBeNull();
    });
  });
}); 