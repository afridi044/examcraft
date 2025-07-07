import { flashcardService } from '../flashcard.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('flashcardService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createFlashcard', () => {
    const input = {
      front: 'What is JavaScript?',
      back: 'A programming language',
      userId: 'user123',
      topicId: 'topic1'
    };

    it('creates flashcard successfully', async () => {
      const mockResponse = {
        id: 'flashcard1',
        front: 'What is JavaScript?',
        back: 'A programming language',
        user_id: 'user123'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.createFlashcard(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards', input);
    });

    it('handles creation error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Failed to create flashcard',
        success: false
      });

      const result = await flashcardService.createFlashcard(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create flashcard');
    });
  });

  describe('generateAIFlashcards', () => {
    const input = {
      topic: 'React Hooks',
      count: 5,
      userId: 'user123',
      difficulty: 'medium' as const,
      topicId: 'topic1'
    };

    it('generates AI flashcards successfully', async () => {
      const mockResponse = {
        flashcards: [
          { id: 'fc1', front: 'What is useState?', back: 'A React Hook' },
          { id: 'fc2', front: 'What is useEffect?', back: 'A React Hook for side effects' }
        ],
        topic_id: 'topic1',
        topic_name: 'React Hooks',
        generated_count: 2,
        requested_count: 5,
        message: 'Generated 2 flashcards'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.generateAIFlashcards(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/generate-ai', {
        topic_id: 'topic1',
        topic_name: 'React Hooks',
        num_flashcards: 5,
        difficulty: 3
      });
    });

    it('handles AI generation error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'AI service unavailable',
        success: false
      });

      const result = await flashcardService.generateAIFlashcards(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service unavailable');
    });

    it('maps difficulty levels correctly', async () => {
      const easyInput = { ...input, difficulty: 'easy' as const };
      const hardInput = { ...input, difficulty: 'hard' as const };

      mockedApiClient.post.mockResolvedValue({
        data: { flashcards: [], topic_name: 'Test', generated_count: 0, requested_count: 1, message: 'Test' },
        error: null,
        success: true
      });

      await flashcardService.generateAIFlashcards(easyInput);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/generate-ai', expect.objectContaining({
        difficulty: 1
      }));

      await flashcardService.generateAIFlashcards(hardInput);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/generate-ai', expect.objectContaining({
        difficulty: 5
      }));
    });
  });

  describe('createFromQuestion', () => {
    const input = {
      questionId: 'question1',
      userId: 'user123',
      topicId: 'topic1'
    };

    it('creates flashcard from question successfully', async () => {
      const mockResponse = {
        id: 'flashcard1',
        front: 'Question text',
        back: 'Answer text',
        user_id: 'user123'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.createFromQuestion(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/generate-from-question', {
        question_id: 'question1',
        topic_id: 'topic1'
      });
    });
  });

  describe('getUserFlashcards', () => {
    const userId = 'user123';

    it('returns user flashcards successfully', async () => {
      const mockResponse = [
        { id: 'fc1', front: 'Question 1', back: 'Answer 1', topic: { name: 'JavaScript' } },
        { id: 'fc2', front: 'Question 2', back: 'Answer 2', topic: { name: 'React' } }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.getUserFlashcards(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/flashcards/user');
    });

    it('handles empty flashcard list', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: [],
        error: null,
        success: true
      });

      const result = await flashcardService.getUserFlashcards(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getDueFlashcards', () => {
    const userId = 'user123';

    it('returns due flashcards successfully', async () => {
      const mockResponse = [
        { id: 'fc1', front: 'Due Question 1', back: 'Answer 1', topic: { name: 'JavaScript' } }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.getDueFlashcards(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/flashcards/due');
    });
  });

  describe('checkFlashcardExists', () => {
    const userId = 'user123';
    const questionId = 'question1';

    it('checks flashcard existence successfully', async () => {
      const mockResponse = { exists: true };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.checkFlashcardExists(questionId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/flashcards/exists/${questionId}`);
    });
  });

  describe('checkFlashcardsExistBatch', () => {
    const input = {
      userId: 'user123',
      questionIds: ['question1', 'question2', 'question3']
    };

    it('checks multiple flashcards existence successfully', async () => {
      const mockResponse = {
        'question1': true,
        'question2': false,
        'question3': true
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.checkFlashcardsExistBatch(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/exists-batch', {
        question_ids: ['question1', 'question2', 'question3']
      });
    });
  });

  describe('startStudySession', () => {
    const input = {
      userId: 'user123',
      topicId: 'topic1',
      sessionType: 'learning' as const
    };

    it('starts study session successfully', async () => {
      const mockResponse = {
        session: {
          session_id: 'session1',
          topic_id: 'topic1',
          topic_name: 'JavaScript',
          total_cards: 10,
          mastery_status: 'learning',
          cards: [
            { id: 'fc1', front: 'Question 1', back: 'Answer 1' }
          ]
        },
        message: 'Study session started'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.startStudySession(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/study-session', {
        topic_id: 'topic1',
        mastery_status: 'learning'
      });
    });

    it('handles session start error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'No flashcards available',
        success: false
      });

      const result = await flashcardService.startStudySession(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No flashcards available');
    });
  });

  describe('updateProgress', () => {
    const input = {
      flashcardId: 'flashcard1',
      quality: 4,
      timeSpent: 30
    };

    it('updates progress successfully', async () => {
      const mockResponse = {
        flashcard_id: 'flashcard1',
        performance: 'know',
        mastery_status: 'learning',
        consecutive_correct: 2,
        message: 'Progress updated',
        invalidate_cache: true
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.updateProgress(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/update-progress', {
        flashcard_id: 'flashcard1',
        performance: 'know',
        study_time_seconds: 30
      });
    });

    it('maps quality to performance correctly', async () => {
      // Test quality >= 3 maps to 'know'
      const highQualityInput = { ...input, quality: 5 };
      const lowQualityInput = { ...input, quality: 2 };

      mockedApiClient.post.mockResolvedValue({
        data: { flashcard_id: 'fc1', performance: 'know', mastery_status: 'learning', consecutive_correct: 1, message: 'Test', invalidate_cache: false },
        error: null,
        success: true
      });

      await flashcardService.updateProgress(highQualityInput);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/update-progress', expect.objectContaining({
        performance: 'know'
      }));

      await flashcardService.updateProgress(lowQualityInput);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/flashcards/update-progress', expect.objectContaining({
        performance: 'dont_know'
      }));
    });
  });

  describe('updateFlashcard', () => {
    const flashcardId = 'flashcard1';
    const input = {
      front: 'Updated Question',
      back: 'Updated Answer'
    };

    it('updates flashcard successfully', async () => {
      const mockResponse = {
        id: flashcardId,
        front: 'Updated Question',
        back: 'Updated Answer'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await flashcardService.updateFlashcard(flashcardId, input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/flashcards/${flashcardId}`, input);
    });
  });

  describe('deleteFlashcard', () => {
    const flashcardId = 'flashcard1';

    it('deletes flashcard successfully', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: undefined,
        error: null,
        success: true
      });

      const result = await flashcardService.deleteFlashcard(flashcardId);

      expect(result.success).toBe(true);
      expect(mockedApiClient.delete).toHaveBeenCalledWith(`/flashcards/${flashcardId}`);
    });

    it('handles deletion error', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Flashcard not found',
        success: false
      });

      const result = await flashcardService.deleteFlashcard(flashcardId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Flashcard not found');
    });
  });
}); 