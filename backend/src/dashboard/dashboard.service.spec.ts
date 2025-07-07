import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DatabaseService } from '../database/database.service';
import { Logger } from '@nestjs/common';
import type { ApiResponse, DashboardStats, RecentActivity, TopicProgress } from '../types/shared.types';

describe('DashboardService', () => {
  let service: DashboardService;
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
        DashboardService,
        { provide: DatabaseService, useValue: {
          getDashboardStats: jest.fn(),
          getRecentActivity: jest.fn(),
          getTopicProgress: jest.fn(),
          getAllDashboardData: jest.fn(),
        } },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    databaseService = module.get(DatabaseService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should call databaseService.getDashboardStats and return result', async () => {
      const userId = 'user-1';
      const stats: DashboardStats = {
        totalQuizzes: 5,
        totalExams: 2,
        totalFlashcards: 10,
        averageScore: 85,
        studyStreak: 7,
        questionsAnswered: 50,
        correctAnswers: 40,
      };
      const mockResponse: ApiResponse<DashboardStats> = { success: true, data: stats, error: null };
      databaseService.getDashboardStats.mockResolvedValue(mockResponse);
      const result = await service.getDashboardStats(userId);
      expect(databaseService.getDashboardStats).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('dashboard stats'));
    });
    it('should handle error from databaseService', async () => {
      const userId = 'user-1';
      const mockResponse: ApiResponse<DashboardStats> = { success: false, data: null, error: 'db error' };
      databaseService.getDashboardStats.mockResolvedValue(mockResponse);
      const result = await service.getDashboardStats(userId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('db error');
    });
  });

  describe('getRecentActivity', () => {
    it('should call databaseService.getRecentActivity and return result', async () => {
      const userId = 'user-1';
      const limit = 5;
      const activities: RecentActivity[] = [
        { id: 'a1', type: 'quiz', title: 'Quiz 1', score: 90, completed_at: '2024-06-01', topic: 'Math' },
        { id: 'a2', type: 'exam', title: 'Exam 1', score: 80, completed_at: '2024-06-02', topic: 'Physics' },
      ];
      const mockResponse: ApiResponse<RecentActivity[]> = { success: true, data: activities, error: null };
      databaseService.getRecentActivity.mockResolvedValue(mockResponse);
      const result = await service.getRecentActivity(userId, limit);
      expect(databaseService.getRecentActivity).toHaveBeenCalledWith(userId, limit);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('recent activity'));
    });
    it('should use default limit if not provided', async () => {
      const userId = 'user-1';
      const mockResponse: ApiResponse<RecentActivity[]> = { success: true, data: [], error: null };
      databaseService.getRecentActivity.mockResolvedValue(mockResponse);
      await service.getRecentActivity(userId);
      expect(databaseService.getRecentActivity).toHaveBeenCalledWith(userId, 10);
    });
    it('should handle error from databaseService', async () => {
      const userId = 'user-1';
      const mockResponse: ApiResponse<RecentActivity[]> = { success: false, data: null, error: 'db error' };
      databaseService.getRecentActivity.mockResolvedValue(mockResponse);
      const result = await service.getRecentActivity(userId, 3);
      expect(result.success).toBe(false);
      expect(result.error).toBe('db error');
    });
  });

  describe('getTopicProgress', () => {
    it('should call databaseService.getTopicProgress and return result', async () => {
      const userId = 'user-1';
      const progress: TopicProgress[] = [
        { topic_id: 't1', topic_name: 'Math', progress_percentage: 80, questions_attempted: 10, questions_correct: 8, last_activity: '2024-06-01' },
      ];
      const mockResponse: ApiResponse<TopicProgress[]> = { success: true, data: progress, error: null };
      databaseService.getTopicProgress.mockResolvedValue(mockResponse);
      const result = await service.getTopicProgress(userId);
      expect(databaseService.getTopicProgress).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('topic progress'));
    });
    it('should handle error from databaseService', async () => {
      const userId = 'user-1';
      const mockResponse: ApiResponse<TopicProgress[]> = { success: false, data: null, error: 'db error' };
      databaseService.getTopicProgress.mockResolvedValue(mockResponse);
      const result = await service.getTopicProgress(userId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('db error');
    });
  });

  describe('getAllDashboardData', () => {
    it('should call databaseService.getAllDashboardData and return result', async () => {
      const userId = 'user-1';
      const mockData = {
        stats: {
          totalQuizzes: 5,
          totalExams: 2,
          totalFlashcards: 10,
          averageScore: 85,
          studyStreak: 7,
          questionsAnswered: 50,
          correctAnswers: 40,
        },
        recentActivity: [],
        topicProgress: [],
      };
      const mockResponse: ApiResponse<typeof mockData> = { success: true, data: mockData, error: null };
      databaseService.getAllDashboardData.mockResolvedValue(mockResponse);
      const result = await service.getAllDashboardData(userId);
      expect(databaseService.getAllDashboardData).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('all dashboard data'));
    });
    it('should handle error from databaseService', async () => {
      const userId = 'user-1';
      const mockResponse: ApiResponse<any> = { success: false, data: null, error: 'db error' };
      databaseService.getAllDashboardData.mockResolvedValue(mockResponse);
      const result = await service.getAllDashboardData(userId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('db error');
    });
  });
});
