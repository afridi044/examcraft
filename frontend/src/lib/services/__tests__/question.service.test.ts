import { questionService } from '../question.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('questionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuestionsWithOptions', () => {
    it('fetches questions without filters successfully', async () => {
      const mockQuestions = [
        {
          question_id: 'q1',
          content: 'What is React?',
          question_type: 'multiple-choice',
          difficulty: 3,
          topic_id: 't1',
          question_options: [
            { option_id: 'o1', content: 'A JavaScript library', is_correct: true },
            { option_id: 'o2', content: 'A programming language', is_correct: false }
          ]
        }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockQuestions,
        error: null,
        success: true
      });

      const result = await questionService.getQuestionsWithOptions();

      expect(result).toEqual({
        data: mockQuestions,
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/questions');
    });

    it('fetches questions with all filters successfully', async () => {
      const mockQuestions = [
        {
          question_id: 'q1',
          content: 'What is TypeScript?',
          question_type: 'multiple-choice',
          difficulty: 2,
          topic_id: 't1',
          question_options: [
            { option_id: 'o1', content: 'A superset of JavaScript', is_correct: true },
            { option_id: 'o2', content: 'A database', is_correct: false }
          ]
        }
      ];

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockQuestions,
        error: null,
        success: true
      });

      const filters = {
        topicId: 't1',
        difficulty: 2,
        questionType: 'multiple-choice',
        limit: 10
      };

      const result = await questionService.getQuestionsWithOptions(filters);

      expect(result).toEqual({
        data: mockQuestions,
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/questions?topic_id=t1&difficulty=2&question_type=multiple-choice&limit=10');
    });

    it('handles API error response', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Failed to fetch questions',
        success: false
      });

      const result = await questionService.getQuestionsWithOptions();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch questions');
      expect(result.data).toBeNull();
    });

    it('handles network error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await questionService.getQuestionsWithOptions();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('getQuestionById', () => {
    it('fetches question by ID successfully', async () => {
      const mockQuestion = {
        question_id: 'q1',
        content: 'What is JavaScript?',
        question_type: 'multiple-choice',
        difficulty: 1,
        topic_id: 't1',
        question_options: [
          { option_id: 'o1', content: 'A programming language', is_correct: true },
          { option_id: 'o2', content: 'A markup language', is_correct: false }
        ]
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockQuestion,
        error: null,
        success: true
      });

      const result = await questionService.getQuestionById('q1');

      expect(result).toEqual({
        data: mockQuestion,
        error: null,
        success: true
      });
      expect(mockedApiClient.get).toHaveBeenCalledWith('/questions/q1');
    });

    it('handles question not found error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Question not found',
        success: false
      });

      const result = await questionService.getQuestionById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Question not found');
      expect(result.data).toBeNull();
    });

    it('handles network error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await questionService.getQuestionById('q1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('createQuestionWithOptions', () => {
    it('creates question with options successfully', async () => {
      const mockCreatedQuestion = {
        question_id: 'q1',
        content: 'What is React?',
        question_type: 'multiple-choice',
        difficulty: 3,
        topic_id: 't1',
        question_options: [
          { option_id: 'o1', content: 'A JavaScript library', is_correct: true },
          { option_id: 'o2', content: 'A programming language', is_correct: false }
        ]
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockCreatedQuestion,
        error: null,
        success: true
      });

      const question = {
        content: 'What is React?',
        question_type: 'multiple-choice',
        difficulty: 3,
        topic_id: 't1'
      };

      const options = [
        { content: 'A JavaScript library', is_correct: true },
        { content: 'A programming language', is_correct: false }
      ];

      const result = await questionService.createQuestionWithOptions(question, options);

      expect(result).toEqual({
        data: mockCreatedQuestion,
        error: null,
        success: true
      });
      expect(mockedApiClient.post).toHaveBeenCalledWith('/questions', {
        question,
        options
      });
    });

    it('handles creation error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Invalid question data',
        success: false
      });

      const question = {
        content: '',
        question_type: 'multiple-choice',
        difficulty: 3,
        topic_id: 't1'
      };

      const options = [
        { content: 'Option 1', is_correct: true }
      ];

      const result = await questionService.createQuestionWithOptions(question, options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid question data');
      expect(result.data).toBeNull();
    });

    it('handles network error during creation', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const question = {
        content: 'What is React?',
        question_type: 'multiple-choice',
        difficulty: 3,
        topic_id: 't1'
      };

      const options = [
        { content: 'A JavaScript library', is_correct: true }
      ];

      const result = await questionService.createQuestionWithOptions(question, options);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('updateQuestion', () => {
    it('updates question successfully', async () => {
      const mockUpdatedQuestion = {
        question_id: 'q1',
        content: 'Updated question content',
        question_type: 'multiple-choice',
        difficulty: 4,
        topic_id: 't1'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockUpdatedQuestion,
        error: null,
        success: true
      });

      const updateData = {
        content: 'Updated question content',
        difficulty: 4
      };

      const result = await questionService.updateQuestion('q1', updateData);

      expect(result).toEqual({
        data: mockUpdatedQuestion,
        error: null,
        success: true
      });
      expect(mockedApiClient.patch).toHaveBeenCalledWith('/questions/q1', updateData);
    });

    it('handles update error', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'Question not found',
        success: false
      });

      const updateData = {
        content: 'Updated content'
      };

      const result = await questionService.updateQuestion('nonexistent', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Question not found');
      expect(result.data).toBeNull();
    });

    it('handles network error during update', async () => {
      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const updateData = {
        content: 'Updated content'
      };

      const result = await questionService.updateQuestion('q1', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });

  describe('deleteQuestion', () => {
    it('deletes question successfully', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: null,
        success: true
      });

      const result = await questionService.deleteQuestion('q1');

      expect(result).toEqual({
        data: null,
        error: null,
        success: true
      });
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/questions/q1');
    });

    it('handles deletion error', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Question not found',
        success: false
      });

      const result = await questionService.deleteQuestion('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Question not found');
      expect(result.data).toBeNull();
    });

    it('handles network error during deletion', async () => {
      mockedApiClient.delete.mockResolvedValueOnce({
        data: null,
        error: 'Network error',
        success: false
      });

      const result = await questionService.deleteQuestion('q1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });
  });
}); 