import { Test, TestingModule } from '@nestjs/testing';
import { TopicsService } from './topics.service';
import { DatabaseService } from '../database/database.service';
import { Logger } from '@nestjs/common';
import { CreateTopicInput } from '../types/shared.types';
import type { ApiResponse } from '../types/shared.types';
import type { Tables } from '../types/supabase.generated';

type TopicRow = Tables<'topics'>;

describe('TopicsService', () => {
  let service: TopicsService;
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
        TopicsService,
        { provide: DatabaseService, useValue: {
          getAllTopics: jest.fn(),
          getTopicById: jest.fn(),
          createTopic: jest.fn(),
          updateTopic: jest.fn(),
          deleteTopic: jest.fn(),
        } },
      ],
    }).compile();

    service = module.get<TopicsService>(TopicsService);
    databaseService = module.get(DatabaseService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTopics', () => {
    it('should return all topics successfully', async () => {
      const mockTopics: TopicRow[] = [
        {
          topic_id: 'topic-1',
          name: 'Mathematics',
          description: 'Advanced mathematics topics',
          parent_topic_id: null,
        },
        {
          topic_id: 'topic-2',
          name: 'Physics',
          description: 'Physics fundamentals',
          parent_topic_id: null,
        },
        {
          topic_id: 'topic-3',
          name: 'Calculus',
          description: 'Calculus sub-topic',
          parent_topic_id: 'topic-1',
        },
      ];

      const mockResponse: ApiResponse<TopicRow[]> = { 
        success: true, 
        data: mockTopics, 
        error: null 
      };

      databaseService.getAllTopics.mockResolvedValue(mockResponse);

      const result = await service.getAllTopics();

      expect(databaseService.getAllTopics).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data?.[0].name).toBe('Mathematics');
      expect(result.data?.[2].parent_topic_id).toBe('topic-1');
    });

    it('should handle empty topics list', async () => {
      const mockResponse: ApiResponse<TopicRow[]> = { 
        success: true, 
        data: [], 
        error: null 
      };

      databaseService.getAllTopics.mockResolvedValue(mockResponse);

      const result = await service.getAllTopics();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle database error', async () => {
      const mockResponse: ApiResponse<TopicRow[]> = { 
        success: false, 
        data: null, 
        error: 'Database connection failed' 
      };

      databaseService.getAllTopics.mockResolvedValue(mockResponse);

      const result = await service.getAllTopics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.data).toBeNull();
    });
  });

  describe('getTopicById', () => {
    it('should return topic by ID successfully', async () => {
      const mockTopic: TopicRow = {
        topic_id: 'topic-1',
        name: 'Mathematics',
        description: 'Advanced mathematics topics',
        parent_topic_id: null,
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: true, 
        data: mockTopic, 
        error: null 
      };

      databaseService.getTopicById.mockResolvedValue(mockResponse);

      const result = await service.getTopicById('topic-1');

      expect(databaseService.getTopicById).toHaveBeenCalledWith('topic-1');
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data?.topic_id).toBe('topic-1');
      expect(result.data?.name).toBe('Mathematics');
    });

    it('should handle topic not found', async () => {
      const mockResponse: ApiResponse<TopicRow> = { 
        success: false, 
        data: null, 
        error: 'Topic not found' 
      };

      databaseService.getTopicById.mockResolvedValue(mockResponse);

      const result = await service.getTopicById('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic not found');
      expect(result.data).toBeNull();
    });

    it('should handle database error', async () => {
      const mockResponse: ApiResponse<TopicRow> = { 
        success: false, 
        data: null, 
        error: 'Database error' 
      };

      databaseService.getTopicById.mockResolvedValue(mockResponse);

      const result = await service.getTopicById('topic-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('createTopic', () => {
    it('should create topic successfully', async () => {
      const input: CreateTopicInput = {
        name: 'Chemistry',
        description: 'Chemistry fundamentals',
        parent_topic_id: null,
      };

      const createdTopic: TopicRow = {
        topic_id: 'topic-4',
        name: 'Chemistry',
        description: 'Chemistry fundamentals',
        parent_topic_id: null,
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: true, 
        data: createdTopic, 
        error: null 
      };

      databaseService.createTopic.mockResolvedValue(mockResponse);

      const result = await service.createTopic(input);

      expect(databaseService.createTopic).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Chemistry');
      expect(result.data?.topic_id).toBe('topic-4');
    });

    it('should create topic with parent topic', async () => {
      const input: CreateTopicInput = {
        name: 'Organic Chemistry',
        description: 'Organic chemistry sub-topic',
        parent_topic_id: 'topic-4',
      };

      const createdTopic: TopicRow = {
        topic_id: 'topic-5',
        name: 'Organic Chemistry',
        description: 'Organic chemistry sub-topic',
        parent_topic_id: 'topic-4',
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: true, 
        data: createdTopic, 
        error: null 
      };

      databaseService.createTopic.mockResolvedValue(mockResponse);

      const result = await service.createTopic(input);

      expect(databaseService.createTopic).toHaveBeenCalledWith(input);
      expect(result.success).toBe(true);
      expect(result.data?.parent_topic_id).toBe('topic-4');
    });

    it('should handle creation error', async () => {
      const input: CreateTopicInput = {
        name: 'Duplicate Topic',
        description: 'This topic already exists',
        parent_topic_id: null,
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: false, 
        data: null, 
        error: 'Topic with this name already exists' 
      };

      databaseService.createTopic.mockResolvedValue(mockResponse);

      const result = await service.createTopic(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic with this name already exists');
      expect(result.data).toBeNull();
    });

    it('should handle database error during creation', async () => {
      const input: CreateTopicInput = {
        name: 'New Topic',
        description: 'A new topic',
        parent_topic_id: null,
      };

      databaseService.createTopic.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createTopic(input)).rejects.toThrow('Database connection failed');
    });
  });

  describe('updateTopic', () => {
    it('should update topic successfully', async () => {
      const topicId = 'topic-1';
      const updateInput = {
        name: 'Advanced Mathematics',
        description: 'Updated description for advanced mathematics',
      };

      const updatedTopic: TopicRow = {
        topic_id: 'topic-1',
        name: 'Advanced Mathematics',
        description: 'Updated description for advanced mathematics',
        parent_topic_id: null,
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: true, 
        data: updatedTopic, 
        error: null 
      };

      databaseService.updateTopic.mockResolvedValue(mockResponse);

      const result = await service.updateTopic(topicId, updateInput);

      expect(databaseService.updateTopic).toHaveBeenCalledWith(topicId, updateInput);
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Advanced Mathematics');
      expect(result.data?.description).toBe('Updated description for advanced mathematics');
    });

    it('should update topic with partial data', async () => {
      const topicId = 'topic-2';
      const updateInput = {
        description: 'Only updating description',
      };

      const updatedTopic: TopicRow = {
        topic_id: 'topic-2',
        name: 'Physics', // unchanged
        description: 'Only updating description',
        parent_topic_id: null,
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: true, 
        data: updatedTopic, 
        error: null 
      };

      databaseService.updateTopic.mockResolvedValue(mockResponse);

      const result = await service.updateTopic(topicId, updateInput);

      expect(databaseService.updateTopic).toHaveBeenCalledWith(topicId, updateInput);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Physics'); // original name preserved
      expect(result.data?.description).toBe('Only updating description');
    });

    it('should handle topic not found during update', async () => {
      const topicId = 'non-existent';
      const updateInput = {
        name: 'Updated Name',
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: false, 
        data: null, 
        error: 'Topic not found' 
      };

      databaseService.updateTopic.mockResolvedValue(mockResponse);

      const result = await service.updateTopic(topicId, updateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic not found');
      expect(result.data).toBeNull();
    });

    it('should handle update error', async () => {
      const topicId = 'topic-1';
      const updateInput = {
        name: 'Invalid Name',
      };

      const mockResponse: ApiResponse<TopicRow> = { 
        success: false, 
        data: null, 
        error: 'Validation error: Name cannot be empty' 
      };

      databaseService.updateTopic.mockResolvedValue(mockResponse);

      const result = await service.updateTopic(topicId, updateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error: Name cannot be empty');
    });

    it('should handle database error during update', async () => {
      const topicId = 'topic-1';
      const updateInput = {
        name: 'Updated Name',
      };

      databaseService.updateTopic.mockRejectedValue(new Error('Database error'));

      await expect(service.updateTopic(topicId, updateInput)).rejects.toThrow('Database error');
    });
  });

  describe('deleteTopic', () => {
    it('should delete topic successfully', async () => {
      const topicId = 'topic-1';

      const mockResponse: ApiResponse<boolean> = { 
        success: true, 
        data: true, 
        error: null 
      };

      databaseService.deleteTopic.mockResolvedValue(mockResponse);

      const result = await service.deleteTopic(topicId);

      expect(databaseService.deleteTopic).toHaveBeenCalledWith(topicId);
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should handle topic not found during deletion', async () => {
      const topicId = 'non-existent';

      const mockResponse: ApiResponse<boolean> = { 
        success: false, 
        data: false, 
        error: 'Topic not found' 
      };

      databaseService.deleteTopic.mockResolvedValue(mockResponse);

      const result = await service.deleteTopic(topicId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic not found');
      expect(result.data).toBe(false);
    });

    it('should handle deletion error due to foreign key constraints', async () => {
      const topicId = 'topic-1';

      const mockResponse: ApiResponse<boolean> = { 
        success: false, 
        data: false, 
        error: 'Cannot delete topic: has associated questions' 
      };

      databaseService.deleteTopic.mockResolvedValue(mockResponse);

      const result = await service.deleteTopic(topicId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete topic: has associated questions');
      expect(result.data).toBe(false);
    });

    it('should handle database error during deletion', async () => {
      const topicId = 'topic-1';

      databaseService.deleteTopic.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.deleteTopic(topicId)).rejects.toThrow('Database connection failed');
    });
  });
}); 