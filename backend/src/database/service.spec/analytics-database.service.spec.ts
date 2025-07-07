import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalyticsDatabaseService } from '../services/analytics-database.service';
import { BaseDatabaseService } from '../services/base-database.service';
import { Logger } from '@nestjs/common';
import type {
  ApiResponse,
  DashboardStats,
  RecentActivity,
  TopicProgress,
} from '../../types/shared.types';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('AnalyticsDatabaseService', () => {
  let service: AnalyticsDatabaseService;
  let supabase: any;

  beforeEach(async () => {
    // Create a proper chained mock for supabase
    const createMockChain = (finalResult: any) => {
      return {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(finalResult),
              }),
              mockResolvedValue: finalResult,
            }),
            mockResolvedValue: finalResult,
          }),
          mockResolvedValue: finalResult,
        }),
      };
    };

    supabase = createMockChain({ data: null, error: null });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsDatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
      ],
    }).compile();

    service = module.get(AnalyticsDatabaseService);
    
    // Directly assign to protected properties
    (service as any).supabase = supabase;
    (service as any).logger = mockLogger;
    
    // Mock protected methods
    jest.spyOn(service as any, 'handleSuccess').mockImplementation((data) => ({ success: true, data, error: null }));
    jest.spyOn(service as any, 'handleError').mockImplementation((err, method) => ({ success: false, data: null, error: String(err) }));
    jest.spyOn(service as any, 'calculateStudyStreak').mockResolvedValue({ success: true, data: 5, error: null });
    jest.spyOn(service as any, 'calculateProperAverageScore').mockReturnValue({
      questionsAnswered: 2,
      correctAnswers: 1,
      averageScore: 50,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats on success', async () => {
      // Mock the Promise.all results for the 4 queries
      const mockQuizzesResult = { data: [{ quiz_id: 'q1' }], error: null };
      const mockExamsResult = { data: [{ exam_id: 'e1' }], error: null };
      const mockFlashcardsResult = { data: [{ flashcard_id: 'f1' }], error: null };
      const mockAnswersResult = {
        data: [
          { is_correct: true, quiz_id: 'q1', question_id: 'q1', created_at: '2024-06-01' },
          { is_correct: false, quiz_id: 'q1', question_id: 'q2', created_at: '2024-06-01' },
        ],
        error: null,
      };

      // Mock each query chain
      supabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockQuizzesResult),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockExamsResult),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockFlashcardsResult),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockAnswersResult),
          }),
        });

      // Call
      const result = await service.getDashboardStats('user-1');
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalQuizzes', 1);
      expect(result.data).toHaveProperty('totalExams', 1);
      expect(result.data).toHaveProperty('totalFlashcards', 1);
      expect(result.data).toHaveProperty('questionsAnswered', 2);
      expect(result.data).toHaveProperty('correctAnswers', 1);
      expect(result.data).toHaveProperty('averageScore', 50);
      expect(result.data).toHaveProperty('studyStreak', 5);
      expect(service['handleSuccess']).toHaveBeenCalled();
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: 'fail' }),
        }),
      });
      const result = await service.getDashboardStats('user-1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('boom'); });
      const result = await service.getDashboardStats('user-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activity on success', async () => {
      const quizData = [
        { quiz_id: 'q1', title: 'Quiz 1', created_at: '2024-06-01', topics: [{ name: 'Math' }] },
        { quiz_id: 'q2', title: 'Quiz 2', created_at: '2024-06-02', topics: [{ name: 'Physics' }] },
      ];
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: quizData, error: null }),
            }),
          }),
        }),
      });
      
      const result = await service.getRecentActivity('user-1', 2);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].topic).toBe('Math');
      expect(result.data?.[1].topic).toBe('Physics');
      expect(service['handleSuccess']).toHaveBeenCalled();
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: null, error: 'fail' }),
            }),
          }),
        }),
      });
      const result = await service.getRecentActivity('user-1', 2);
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('boom'); });
      const result = await service.getRecentActivity('user-1', 2);
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });

  describe('getTopicProgress', () => {
    it('should return topic progress on success', async () => {
      const answerData = [
        {
          questions: { topic_id: 't1', topics: [{ name: 'Math' }] },
          is_correct: true,
          created_at: '2024-06-01',
        },
        {
          questions: { topic_id: 't1', topics: [{ name: 'Math' }] },
          is_correct: false,
          created_at: '2024-06-02',
        },
        {
          questions: { topic_id: 't2', topics: [{ name: 'Physics' }] },
          is_correct: true,
          created_at: '2024-06-03',
        },
      ];
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: answerData, error: null }),
        }),
      });
      
      const result = await service.getTopicProgress('user-1');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].topic_name).toBe('Math');
      expect(result.data?.[1].topic_name).toBe('Physics');
      expect(service['handleSuccess']).toHaveBeenCalled();
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: 'fail' }),
        }),
      });
      const result = await service.getTopicProgress('user-1');
      expect(result.success).toBe(false);
      expect(service['handleError']).toHaveBeenCalled();
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('boom'); });
      const result = await service.getTopicProgress('user-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });
  });

  describe('getAllDashboardData', () => {
    it('should call all analytics methods and return combined result', async () => {
      service.getDashboardStats = jest.fn().mockResolvedValue({ success: true, data: { totalQuizzes: 1 }, error: null });
      service.getRecentActivity = jest.fn().mockResolvedValue({ success: true, data: [{ id: 'a1' }], error: null });
      service.getTopicProgress = jest.fn().mockResolvedValue({ success: true, data: [{ topic_id: 't1' }], error: null });
      const result = await service.getAllDashboardData('user-1');
      expect(service.getDashboardStats).toHaveBeenCalledWith('user-1');
      expect(service.getRecentActivity).toHaveBeenCalledWith('user-1');
      expect(service.getTopicProgress).toHaveBeenCalledWith('user-1');
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('stats');
      expect(result.data).toHaveProperty('recentActivity');
      expect(result.data).toHaveProperty('topicProgress');
    });
    it('should handle error if any analytics method fails', async () => {
      service.getDashboardStats = jest.fn().mockResolvedValue({ success: false, data: null, error: 'fail' });
      const result = await service.getAllDashboardData('user-1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('fail');
    });
  });
}); 