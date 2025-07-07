import { Test, TestingModule } from '@nestjs/testing';
import { FlashcardsService } from './flashcards.service';
import { DatabaseService } from '../database/database.service';
import { AiFlashcardService } from './services/ai-flashcard.service';
import { ProgressTrackingService } from './services/progress-tracking.service';
import { Logger } from '@nestjs/common';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { GenerateAiFlashcardsDto } from './dto/generate-ai-flashcards.dto';
import { StudySessionDto } from './dto/study-session.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CreateFlashcardFromQuestionDto } from './dto/create-from-question.dto';
import type { ApiResponse } from '../types/shared.types';

describe('FlashcardsService (CRUD & Existence)', () => {
  let service: FlashcardsService;
  let databaseService: jest.Mocked<DatabaseService>;
  let aiFlashcardService: jest.Mocked<AiFlashcardService>;
  let progressTrackingService: jest.Mocked<ProgressTrackingService>;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlashcardsService,
        {
          provide: DatabaseService, useValue: {
            createFlashcard: jest.fn(),
            createTopic: jest.fn(),
            getFlashcardByUserAndSourceQuestion: jest.fn(),
            getFlashcardsByUserAndQuestionIds: jest.fn(),
            getUserFlashcards: jest.fn(),
            updateFlashcard: jest.fn(),
            deleteFlashcard: jest.fn(),
            getFlashcardsByTopicAndMastery: jest.fn(),
            getFlashcardsByTopic: jest.fn(),
            getFlashcardById: jest.fn(),
            getQuestionById: jest.fn(),
            getFlashcardsDueForReview: jest.fn(),
          }
        },
        {
          provide: AiFlashcardService, useValue: {
            generateFlashcardsWithAI: jest.fn(),
          }
        },
        {
          provide: ProgressTrackingService, useValue: {
            calculateMasteryStatus: jest.fn(),
            getMasteryMessage: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<FlashcardsService>(FlashcardsService);
    databaseService = module.get(DatabaseService);
    aiFlashcardService = module.get(AiFlashcardService);
    progressTrackingService = module.get(ProgressTrackingService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFlashcard', () => {
    it('should create flashcard with existing topic', async () => {
      const dto: CreateFlashcardDto = {
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        tags: ['tag1'],
      };
      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        source_question_id: null,
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };
      const mockResponse: ApiResponse<any> = { success: true, data: mockFlashcard, error: null };
      databaseService.createFlashcard.mockResolvedValue(mockResponse);
      const result = await service.createFlashcard(dto, 'user-1');
      expect(databaseService.createFlashcard).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', question: dto.question, answer: dto.answer, topic_id: dto.topic_id, tags: dto.tags }));
      expect(result).toEqual(mockResponse);
    });

    it('should create flashcard with custom topic', async () => {
      const dto: CreateFlashcardDto = {
        question: 'Q?',
        answer: 'A',
        custom_topic: 'Custom',
        tags: ['tag1'],
      };
      const topicRes = { success: true, data: { topic_id: 'topic-custom', name: 'Custom', description: null, parent_topic_id: null }, error: null };
      const mockFlashcard = {
        flashcard_id: 'f2',
        user_id: 'user-1',
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-custom',
        source_question_id: null,
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };
      const flashRes = { success: true, data: mockFlashcard, error: null };
      databaseService.createTopic.mockResolvedValue(topicRes);
      databaseService.createFlashcard.mockResolvedValue(flashRes);
      const result = await service.createFlashcard(dto, 'user-1');
      expect(databaseService.createTopic).toHaveBeenCalledWith(expect.objectContaining({ name: 'Custom' }));
      expect(databaseService.createFlashcard).toHaveBeenCalledWith(expect.objectContaining({ topic_id: 'topic-custom' }));
      expect(result).toEqual(flashRes);
    });

    it('should handle custom topic creation failure', async () => {
      const dto: CreateFlashcardDto = {
        question: 'Q?',
        answer: 'A',
        custom_topic: 'Custom',
        tags: ['tag1'],
      };
      const topicRes = { success: false, data: null, error: 'fail' };
      databaseService.createTopic.mockResolvedValue(topicRes);
      const result = await service.createFlashcard(dto, 'user-1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('fail');
    });

    it('should handle database error', async () => {
      const dto: CreateFlashcardDto = {
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        tags: ['tag1'],
      };
      databaseService.createFlashcard.mockRejectedValue(new Error('db error'));
      const result = await service.createFlashcard(dto, 'user-1');
      expect(result.success).toBe(false);
      expect(result.error).toBe('db error');
    });
  });

  describe('hasFlashcard', () => {
    it('should return true if flashcard exists', async () => {
      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        source_question_id: null,
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };
      databaseService.getFlashcardByUserAndSourceQuestion.mockResolvedValue({ success: true, data: mockFlashcard, error: null });
      const result = await service.hasFlashcard('user-1', 'q-1');
      expect(result).toBe(true);
    });
    it('should return false if flashcard does not exist', async () => {
      databaseService.getFlashcardByUserAndSourceQuestion.mockResolvedValue({ success: true, data: null, error: null });
      const result = await service.hasFlashcard('user-1', 'q-1');
      expect(result).toBe(false);
    });
    it('should return false on error', async () => {
      databaseService.getFlashcardByUserAndSourceQuestion.mockResolvedValue({ success: false, data: null, error: 'err' });
      const result = await service.hasFlashcard('user-1', 'q-1');
      expect(result).toBe(false);
    });
  });

  describe('hasFlashcardsBatch', () => {
    it('should return array of ids if found', async () => {
      databaseService.getFlashcardsByUserAndQuestionIds.mockResolvedValue({ success: true, data: ['id1', 'id2'], error: null });
      const result = await service.hasFlashcardsBatch('user-1', ['q1', 'q2']);
      expect(result).toEqual(['id1', 'id2']);
    });
    it('should return empty array on error', async () => {
      databaseService.getFlashcardsByUserAndQuestionIds.mockResolvedValue({ success: false, data: null, error: 'err' });
      const result = await service.hasFlashcardsBatch('user-1', ['q1', 'q2']);
      expect(result).toEqual([]);
    });
  });

  describe('getUserFlashcards', () => {
    it('should call databaseService.getUserFlashcards', async () => {
      databaseService.getUserFlashcards.mockResolvedValue({ success: true, data: [], error: null });
      const result = await service.getUserFlashcards('user-1');
      expect(databaseService.getUserFlashcards).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ success: true, data: [], error: null });
    });
  });

  describe('updateFlashcard', () => {
    it('should update flashcard with existing topic', async () => {
      const dto: UpdateFlashcardDto = {
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        mastery_status: 'learning',
        tags: ['tag1'],
      };
      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        source_question_id: null,
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };
      databaseService.updateFlashcard.mockResolvedValue({ success: true, data: mockFlashcard, error: null });
      const result = await service.updateFlashcard('f1', dto);
      expect(databaseService.updateFlashcard).toHaveBeenCalledWith('f1', expect.objectContaining({ topic_id: 'topic-1' }));
      expect(result.success).toBe(true);
    });
    it('should update flashcard with custom topic', async () => {
      const dto: UpdateFlashcardDto = {
        question: 'Q?',
        answer: 'A',
        custom_topic: 'Custom',
        mastery_status: 'learning',
        tags: ['tag1'],
      };
      const topicRes = { success: true, data: { topic_id: 'topic-custom', name: 'Custom', description: null, parent_topic_id: null }, error: null };
      const mockFlashcard = {
        flashcard_id: 'f2',
        user_id: 'user-1',
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-custom',
        source_question_id: null,
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };
      databaseService.createTopic.mockResolvedValue(topicRes);
      databaseService.updateFlashcard.mockResolvedValue({ success: true, data: mockFlashcard, error: null });
      const result = await service.updateFlashcard('f2', dto);
      expect(databaseService.createTopic).toHaveBeenCalledWith(expect.objectContaining({ name: 'Custom' }));
      expect(databaseService.updateFlashcard).toHaveBeenCalledWith('f2', expect.objectContaining({ topic_id: 'topic-custom' }));
      expect(result.success).toBe(true);
    });
    it('should handle error in update', async () => {
      const dto: UpdateFlashcardDto = {
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        mastery_status: 'learning',
        tags: ['tag1'],
      };
      databaseService.updateFlashcard.mockResolvedValue({
        success: false,
        data: null,
        error: 'Database error'
      });
      const result = await service.updateFlashcard('f1', dto);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('deleteFlashcard', () => {
    it('should call databaseService.deleteFlashcard', async () => {
      databaseService.deleteFlashcard.mockResolvedValue({ success: true, data: true, error: null });
      const result = await service.deleteFlashcard('f1', 'user-1');
      expect(databaseService.deleteFlashcard).toHaveBeenCalledWith('f1', 'user-1');
      expect(result).toEqual({ success: true, data: true, error: null });
    });
  });

  describe('generateAiFlashcards', () => {
    it('should generate AI flashcards successfully', async () => {
      const dto: GenerateAiFlashcardsDto = {
        topic_name: 'Mathematics',
        num_flashcards: 5,
        difficulty: 3,
        topic_id: 'topic-1',
      };

      const aiFlashcards = [
        { question: 'What is 2+2?', answer: '4', difficulty: 1 },
        { question: 'What is 3x3?', answer: '9', difficulty: 2 },
      ];

      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'What is 2+2?',
        answer: '4',
        topic_id: 'topic-1',
        source_question_id: null,
        tags: ['ai-generated', 'mathematics', 'difficulty-1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };

      aiFlashcardService.generateFlashcardsWithAI.mockResolvedValue(aiFlashcards);
      databaseService.createFlashcard.mockResolvedValue({ success: true, data: mockFlashcard, error: null });

      const result = await service.generateAiFlashcards(dto, 'user-1');

      expect(result.success).toBe(true);
      expect(result.data?.generated_count).toBe(2);
      expect(result.data?.requested_count).toBe(5);
      expect(result.data?.topic_name).toBe('Mathematics');
      expect(aiFlashcardService.generateFlashcardsWithAI).toHaveBeenCalledWith(dto);
    });

    it('should handle custom topic creation for AI generation', async () => {
      const dto: GenerateAiFlashcardsDto = {
        topic_name: 'Physics',
        num_flashcards: 3,
        difficulty: 2,
        custom_topic: 'Advanced Physics',
      };

      const aiFlashcards = [
        { question: 'What is gravity?', answer: 'A force that attracts objects', difficulty: 2 },
      ];

      const topicRes = { success: true, data: { topic_id: 'topic-physics', name: 'Advanced Physics', description: null, parent_topic_id: null }, error: null };
      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'What is gravity?',
        answer: 'A force that attracts objects',
        topic_id: 'topic-physics',
        source_question_id: null,
        tags: ['ai-generated', 'physics', 'difficulty-2'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };

      aiFlashcardService.generateFlashcardsWithAI.mockResolvedValue(aiFlashcards);
      databaseService.createTopic.mockResolvedValue(topicRes);
      databaseService.createFlashcard.mockResolvedValue({ success: true, data: mockFlashcard, error: null });

      const result = await service.generateAiFlashcards(dto, 'user-1');

      expect(result.success).toBe(true);
      expect(databaseService.createTopic).toHaveBeenCalledWith(expect.objectContaining({ name: 'Advanced Physics' }));
    });

    it('should handle AI generation errors', async () => {
      const dto: GenerateAiFlashcardsDto = {
        topic_name: 'Chemistry',
        num_flashcards: 3,
        difficulty: 2,
        topic_id: 'topic-1',
      };

      aiFlashcardService.generateFlashcardsWithAI.mockRejectedValue(new Error('AI service error'));

      const result = await service.generateAiFlashcards(dto, 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI service error');
    });
  });

  describe('createStudySession', () => {
    it('should create study session with specific mastery status', async () => {
      const dto: StudySessionDto = {
        topic_id: 'topic-1',
        mastery_status: 'learning',
      };

      const mockFlashcards = [
        {
          flashcard_id: 'f1',
          user_id: 'user-1',
          question: 'Q1?',
          answer: 'A1',
          topic_id: 'topic-1',
          source_question_id: null,
          tags: ['tag1'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mastery_status: 'learning',
          consecutive_correct: 0,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: null,
          topic: { topic_id: 'topic-1', name: 'Mathematics', description: null, parent_topic_id: null },
        },
        {
          flashcard_id: 'f2',
          user_id: 'user-1',
          question: 'Q2?',
          answer: 'A2',
          topic_id: 'topic-1',
          source_question_id: null,
          tags: ['tag2'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mastery_status: 'learning',
          consecutive_correct: 0,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: null,
          topic: { topic_id: 'topic-1', name: 'Mathematics', description: null, parent_topic_id: null },
        },
      ];

      databaseService.getFlashcardsByTopicAndMastery.mockResolvedValue({ success: true, data: mockFlashcards, error: null });

      const result = await service.createStudySession(dto, 'user-1');

      expect(result.success).toBe(true);
      expect(result.data?.session.total_cards).toBe(2);
      expect(result.data?.session.topic_name).toBe('Mathematics');
      expect(result.data?.session.mastery_status).toBe('learning');
      expect(result.data?.fallback).toBe(false);
    });

    it('should create mixed study session', async () => {
      const dto: StudySessionDto = {
        topic_id: 'topic-1',
        mastery_status: 'mixed',
      };

      const learningCards = [
        {
          flashcard_id: 'f1',
          user_id: 'user-1',
          question: 'Q1?',
          answer: 'A1',
          topic_id: 'topic-1',
          source_question_id: null,
          tags: ['tag1'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mastery_status: 'learning',
          consecutive_correct: 0,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: null,
          topic: { topic_id: 'topic-1', name: 'Mathematics', description: null, parent_topic_id: null },
        },
      ];

      const underReviewCards = [
        {
          flashcard_id: 'f2',
          user_id: 'user-1',
          question: 'Q2?',
          answer: 'A2',
          topic_id: 'topic-1',
          source_question_id: null,
          tags: ['tag2'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mastery_status: 'under_review',
          consecutive_correct: 2,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: null,
          topic: { topic_id: 'topic-1', name: 'Mathematics', description: null, parent_topic_id: null },
        },
      ];

      const masteredCards = [
        {
          flashcard_id: 'f3',
          user_id: 'user-1',
          question: 'Q3?',
          answer: 'A3',
          topic_id: 'topic-1',
          source_question_id: null,
          tags: ['tag3'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mastery_status: 'mastered',
          consecutive_correct: 5,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          next_review_date: null,
          topic: { topic_id: 'topic-1', name: 'Mathematics', description: null, parent_topic_id: null },
        },
      ];

      databaseService.getFlashcardsByTopicAndMastery
        .mockResolvedValueOnce({ success: true, data: underReviewCards, error: null })
        .mockResolvedValueOnce({ success: true, data: learningCards, error: null })
        .mockResolvedValueOnce({ success: true, data: masteredCards, error: null });

      const result = await service.createStudySession(dto, 'user-1');

      expect(result.success).toBe(true);
      expect(result.data?.session.mastery_status).toBe('mixed');
    });

    it('should handle no flashcards found', async () => {
      const dto: StudySessionDto = {
        topic_id: 'topic-1',
        mastery_status: 'learning',
      };

      databaseService.getFlashcardsByTopicAndMastery.mockResolvedValue({ success: true, data: [], error: null });
      databaseService.getFlashcardsByTopic.mockResolvedValue({ success: true, data: [], error: null });

      const result = await service.createStudySession(dto, 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No learning flashcards found');
    });
  });

  describe('updateProgress', () => {
    it('should update progress successfully', async () => {
      const dto: UpdateProgressDto = {
        flashcard_id: 'f1',
        performance: 'know',
      };

      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        source_question_id: null,
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 1,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 1,
        next_review_date: null,
      };

      const newValues = {
        mastery_status: 'under_review' as const,
        consecutive_correct: 2,
      };

      const updatedFlashcard = { ...mockFlashcard, ...newValues };

      databaseService.getFlashcardById.mockResolvedValue({ success: true, data: mockFlashcard, error: null });
      progressTrackingService.calculateMasteryStatus.mockReturnValue(newValues);
      progressTrackingService.getMasteryMessage.mockReturnValue('Great job!');
      databaseService.updateFlashcard.mockResolvedValue({ success: true, data: updatedFlashcard, error: null });

      const result = await service.updateProgress(dto);

      expect(result.success).toBe(true);
      expect(result.data?.mastery_status).toBe('under_review');
      expect(result.data?.consecutive_correct).toBe(2);
      expect(result.data?.performance).toBe('know');
      expect(progressTrackingService.calculateMasteryStatus).toHaveBeenCalledWith('know', 'learning', 1);
      expect(progressTrackingService.getMasteryMessage).toHaveBeenCalledWith('know', 'under_review');
    });

    it('should handle flashcard not found', async () => {
      const dto: UpdateProgressDto = {
        flashcard_id: 'f1',
        performance: 'know',
      };

      databaseService.getFlashcardById.mockResolvedValue({ success: false, data: null, error: 'Not found' });

      const result = await service.updateProgress(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Flashcard not found');
    });

    it('should handle update failure', async () => {
      const dto: UpdateProgressDto = {
        flashcard_id: 'f1',
        performance: 'know',
      };

      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'Q?',
        answer: 'A',
        topic_id: 'topic-1',
        source_question_id: null,
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 1,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 1,
        next_review_date: null,
      };

      databaseService.getFlashcardById.mockResolvedValue({ success: true, data: mockFlashcard, error: null });
      progressTrackingService.calculateMasteryStatus.mockReturnValue({ mastery_status: 'under_review' as const, consecutive_correct: 2 });
      databaseService.updateFlashcard.mockResolvedValue({ success: false, data: null, error: 'Update failed' });

      const result = await service.updateProgress(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update flashcard');
    });
  });

  describe('generateFromQuestion', () => {
    it('should generate flashcard from question successfully', async () => {
      const dto: CreateFlashcardFromQuestionDto = {
        question_id: 'q1',
        custom_question: 'What is 2+2?',
        custom_answer: '4',
      };

      const mockQuestion = {
        question_id: 'q1',
        content: 'What is 2+2?',
        question_type: 'multiple-choice',
        difficulty: 1,
        topic_id: 'topic-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        question_options: [
          { option_id: 'opt1', content: '3', is_correct: false, question_id: 'q1' },
          { option_id: 'opt2', content: '4', is_correct: true, question_id: 'q1' },
          { option_id: 'opt3', content: '5', is_correct: false, question_id: 'q1' },
          { option_id: 'opt4', content: '6', is_correct: false, question_id: 'q1' },
        ],
        topic: { topic_id: 'topic-1', name: 'Mathematics', description: null, parent_topic_id: null },
      };

      const mockFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'What is 2+2?',
        answer: '4',
        topic_id: 'topic-1',
        source_question_id: 'q1',
        tags: ['multiple-choice', 'mathematics', 'difficulty-1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };

      databaseService.getQuestionById.mockResolvedValue({ success: true, data: mockQuestion, error: null });
      databaseService.getFlashcardByUserAndSourceQuestion.mockResolvedValue({ success: true, data: null, error: null });
      databaseService.createFlashcard.mockResolvedValue({ success: true, data: mockFlashcard, error: null });

      const result = await service.generateFromQuestion(dto, 'user-1');

      expect(result.success).toBe(true);
      expect(result.data?.flashcard_id).toBe('f1');
      expect(result.data?.source_question_id).toBe('q1');
    });

    it('should handle question not found', async () => {
      const dto: CreateFlashcardFromQuestionDto = {
        question_id: 'q1',
      };

      databaseService.getQuestionById.mockResolvedValue({ success: false, data: null, error: 'Question not found' });

      const result = await service.generateFromQuestion(dto, 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Question not found');
    });

    it('should handle existing flashcard for question', async () => {
      const dto: CreateFlashcardFromQuestionDto = {
        question_id: 'q1',
      };

      const mockQuestion = {
        question_id: 'q1',
        content: 'What is 2+2?',
        question_type: 'multiple-choice',
        difficulty: 1,
        topic_id: 'topic-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        question_options: [],
        topic: { topic_id: 'topic-1', name: 'Mathematics', description: null, parent_topic_id: null },
      };

      const existingFlashcard = {
        flashcard_id: 'f1',
        user_id: 'user-1',
        question: 'What is 2+2?',
        answer: '4',
        topic_id: 'topic-1',
        source_question_id: 'q1',
        tags: ['tag1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mastery_status: 'learning',
        consecutive_correct: 0,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: null,
      };

      databaseService.getQuestionById.mockResolvedValue({ success: true, data: mockQuestion, error: null });
      databaseService.getFlashcardByUserAndSourceQuestion.mockResolvedValue({ success: true, data: existingFlashcard, error: null });

      const result = await service.generateFromQuestion(dto, 'user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Flashcard already exists for this question');
    });
  });

  describe('getDueFlashcards', () => {
    it('should call databaseService.getFlashcardsDueForReview', async () => {
      const mockFlashcards = [
        {
          flashcard_id: 'f1',
          user_id: 'user-1',
          question: 'Q1?',
          answer: 'A1',
          topic_id: 'topic-1',
          source_question_id: null,
          tags: ['tag1'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mastery_status: 'under_review',
          consecutive_correct: 2,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 2,
          next_review_date: new Date().toISOString(),
        },
      ];

      databaseService.getFlashcardsDueForReview.mockResolvedValue({ success: true, data: mockFlashcards, error: null });

      const result = await service.getDueFlashcards('user-1');

      expect(databaseService.getFlashcardsDueForReview).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ success: true, data: mockFlashcards, error: null });
    });
  });
});
