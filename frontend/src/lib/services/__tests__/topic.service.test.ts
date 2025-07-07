import { topicService } from '../topic.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('topicService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTopics', () => {
    it('returns all topics successfully', async () => {
      const mockResponse = [
        {
          id: 'topic1',
          name: 'JavaScript',
          description: 'JavaScript programming language',
          difficulty: 'beginner',
          question_count: 50,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'topic2',
          name: 'React',
          description: 'React library for building user interfaces',
          difficulty: 'intermediate',
          question_count: 30,
          created_at: '2024-01-02T00:00:00Z'
        },
        {
          id: 'topic3',
          name: 'Node.js',
          description: 'Node.js runtime environment',
          difficulty: 'advanced',
          question_count: 25,
          created_at: '2024-01-03T00:00:00Z'
        }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await topicService.getAllTopics();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/topics');
    });

    it('handles empty topics list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await topicService.getAllTopics();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('handles API error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch topics',
        success: false
      });

      const result = await topicService.getAllTopics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch topics');
    });

    it('handles server error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Internal server error',
        success: false
      });

      const result = await topicService.getAllTopics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('getTopicById', () => {
    const topicId = 'topic1';

    it('returns topic by ID successfully', async () => {
      const mockResponse = {
        id: topicId,
        name: 'JavaScript',
        description: 'JavaScript programming language',
        difficulty: 'beginner',
        question_count: 50,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await topicService.getTopicById(topicId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/topics/${topicId}`);
    });

    it('handles topic not found error', async () => {
      const nonExistentTopicId = 'non-existent-topic';

      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Topic not found',
        success: false
      });

      const result = await topicService.getTopicById(nonExistentTopicId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic not found');
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/topics/${nonExistentTopicId}`);
    });

    it('handles invalid topic ID', async () => {
      const invalidTopicId = 'invalid-id';

      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Invalid topic ID',
        success: false
      });

      const result = await topicService.getTopicById(invalidTopicId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid topic ID');
    });
  });

  describe('createTopic', () => {
    const input = {
      name: 'TypeScript',
      description: 'TypeScript programming language',
      difficulty: 'intermediate'
    };

    it('creates topic successfully', async () => {
      const mockResponse = {
        id: 'new-topic-id',
        name: input.name,
        description: input.description,
        difficulty: input.difficulty,
        question_count: 0,
        created_at: '2024-01-20T00:00:00Z'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await topicService.createTopic(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/topics', input);
    });

    it('handles topic name already exists error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Topic name already exists',
        success: false
      });

      const result = await topicService.createTopic(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic name already exists');
    });

    it('handles validation error', async () => {
      const invalidInput = {
        name: '',
        description: 'Invalid topic',
        difficulty: 'invalid-difficulty'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Validation failed',
        success: false
      });

      const result = await topicService.createTopic(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/topics', invalidInput);
    });

    it('handles server error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Internal server error',
        success: false
      });

      const result = await topicService.createTopic(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('updateTopic', () => {
    const topicId = 'topic1';
    const input = {
      name: 'Updated JavaScript',
      description: 'Updated JavaScript description',
      difficulty: 'advanced'
    };

    it('updates topic successfully', async () => {
      const mockResponse = {
        id: topicId,
        name: input.name,
        description: input.description,
        difficulty: input.difficulty,
        question_count: 50,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await topicService.updateTopic(topicId, input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/topics/${topicId}`, input);
    });

    it('handles partial update', async () => {
      const partialInput = {
        name: 'Only Name Updated'
      };

      const mockResponse = {
        id: topicId,
        name: partialInput.name,
        description: 'Original description',
        difficulty: 'beginner',
        question_count: 50,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await topicService.updateTopic(topicId, partialInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/topics/${topicId}`, partialInput);
    });

    it('handles topic not found error', async () => {
      const nonExistentTopicId = 'non-existent-topic';

      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'Topic not found',
        success: false
      });

      const result = await topicService.updateTopic(nonExistentTopicId, input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic not found');
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/topics/${nonExistentTopicId}`, input);
    });

    it('handles validation error', async () => {
      const invalidInput = {
        name: '',
        difficulty: 'invalid-difficulty'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'Invalid topic data',
        success: false
      });

      const result = await topicService.updateTopic(topicId, invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid topic data');
    });

    it('handles empty update input', async () => {
      const emptyInput = {};

      const mockResponse = {
        id: topicId,
        name: 'Original Name',
        description: 'Original description',
        difficulty: 'beginner',
        question_count: 50,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await topicService.updateTopic(topicId, emptyInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/topics/${topicId}`, emptyInput);
    });
  });

  describe('deleteTopic', () => {
    const topicId = 'topic1';

    it('deletes topic successfully', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        error: null,
        success: true
      });

      const result = await topicService.deleteTopic(topicId);

      expect(result.success).toBe(true);
      expect(mockedApiClient.delete).toHaveBeenCalledWith(`/topics/${topicId}`);
    });

    it('handles topic not found error', async () => {
      const nonExistentTopicId = 'non-existent-topic';

      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Topic not found',
        success: false
      });

      const result = await topicService.deleteTopic(nonExistentTopicId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic not found');
      expect(mockedApiClient.delete).toHaveBeenCalledWith(`/topics/${nonExistentTopicId}`);
    });

    it('handles topic with questions error', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Cannot delete topic with existing questions',
        success: false
      });

      const result = await topicService.deleteTopic(topicId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete topic with existing questions');
    });

    it('handles server error', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Internal server error',
        success: false
      });

      const result = await topicService.deleteTopic(topicId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('getTopicsWithProgress', () => {
    const userId = 'user123';

    it('returns topics with progress successfully', async () => {
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

      const result = await topicService.getTopicsWithProgress(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/dashboard/progress/${userId}`);
    });

    it('handles empty progress list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await topicService.getTopicsWithProgress(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('handles progress fetch error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch topic progress',
        success: false
      });

      const result = await topicService.getTopicsWithProgress(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch topic progress');
    });

    it('handles user not found error', async () => {
      const nonExistentUserId = 'non-existent-user';

      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'User not found',
        success: false
      });

      const result = await topicService.getTopicsWithProgress(nonExistentUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/dashboard/progress/${nonExistentUserId}`);
    });
  });
}); 