import { dashboardService } from '../dashboard.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('dashboardService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    const userId = 'user123';

    it('returns user statistics successfully', async () => {
      const mockResponse = {
        total_quizzes: 15,
        total_flashcards: 45,
        study_streak: 7,
        average_score: 85.5,
        total_study_time: 3600,
        topics_studied: 8
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await dashboardService.getUserStats(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/dashboard/stats');
    });

    it('handles API error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch user stats',
        success: false
      });

      const result = await dashboardService.getUserStats(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch user stats');
    });

    it('handles empty stats', async () => {
      const mockResponse = {
        total_quizzes: 0,
        total_flashcards: 0,
        study_streak: 0,
        average_score: 0,
        total_study_time: 0,
        topics_studied: 0
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await dashboardService.getUserStats(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('getRecentActivity', () => {
    const userId = 'user123';

    it('returns recent activity successfully', async () => {
      const mockResponse = [
        {
          id: 'activity1',
          type: 'quiz_completed',
          title: 'JavaScript Quiz',
          timestamp: '2024-01-15T10:30:00Z',
          score: 85,
          topic: 'JavaScript'
        },
        {
          id: 'activity2',
          type: 'flashcard_created',
          title: 'React Hooks',
          timestamp: '2024-01-14T15:45:00Z',
          topic: 'React'
        }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await dashboardService.getRecentActivity(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/dashboard/activity');
    });

    it('handles empty activity list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await dashboardService.getRecentActivity(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('handles activity fetch error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch recent activity',
        success: false
      });

      const result = await dashboardService.getRecentActivity(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch recent activity');
    });
  });

  describe('getTopicProgress', () => {
    const userId = 'user123';

    it('returns topic progress successfully', async () => {
      const mockResponse = [
        {
          topic_id: 'topic1',
          topic_name: 'JavaScript',
          total_questions: 50,
          answered_questions: 35,
          correct_answers: 28,
          progress_percentage: 70,
          mastery_level: 'intermediate'
        },
        {
          topic_id: 'topic2',
          topic_name: 'React',
          total_questions: 30,
          answered_questions: 20,
          correct_answers: 18,
          progress_percentage: 66.7,
          mastery_level: 'beginner'
        }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await dashboardService.getTopicProgress(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/dashboard/progress');
    });

    it('handles empty progress list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await dashboardService.getTopicProgress(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('handles progress fetch error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch topic progress',
        success: false
      });

      const result = await dashboardService.getTopicProgress(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch topic progress');
    });
  });

  describe('getAllDashboardData', () => {
    const userId = 'user123';

    it('returns all dashboard data successfully', async () => {
      const mockResponse = {
        stats: {
          total_quizzes: 15,
          total_flashcards: 45,
          study_streak: 7,
          average_score: 85.5,
          total_study_time: 3600,
          topics_studied: 8
        },
        recentActivity: [
          {
            id: 'activity1',
            type: 'quiz_completed',
            title: 'JavaScript Quiz',
            timestamp: '2024-01-15T10:30:00Z',
            score: 85,
            topic: 'JavaScript'
          }
        ],
        topicProgress: [
          {
            topic_id: 'topic1',
            topic_name: 'JavaScript',
            total_questions: 50,
            answered_questions: 35,
            correct_answers: 28,
            progress_percentage: 70,
            mastery_level: 'intermediate'
          }
        ]
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await dashboardService.getAllDashboardData(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/dashboard/all');
    });

    it('logs API call info in development', async () => {
      const mockResponse = {
        stats: {},
        recentActivity: [],
        topicProgress: []
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      // Mock console.log to capture the log message
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await dashboardService.getAllDashboardData(userId);

      expect(consoleSpy).toHaveBeenCalledWith('🔍 Dashboard API call info:', {
        endpoint: '/dashboard/all',
        fullUrl: 'http://localhost:5001/api/v1/dashboard/all'
      });

      consoleSpy.mockRestore();
    });

    it('handles dashboard data fetch error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch dashboard data',
        success: false
      });

      const result = await dashboardService.getAllDashboardData(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch dashboard data');
    });

    it('handles partial dashboard data', async () => {
      const mockResponse = {
        stats: {
          total_quizzes: 5,
          total_flashcards: 10,
          study_streak: 3,
          average_score: 75,
          total_study_time: 1800,
          topics_studied: 3
        },
        recentActivity: [],
        topicProgress: []
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await dashboardService.getAllDashboardData(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(result.data.stats).toBeDefined();
      expect(result.data.recentActivity).toEqual([]);
      expect(result.data.topicProgress).toEqual([]);
    });
  });
}); 