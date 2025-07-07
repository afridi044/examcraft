import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { DatabaseService } from '../database/database.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import {
  QuizWithQuestions,
  ApiResponse,
  CreateQuizInput,
  CreateTopicInput,
  CreateQuestionInput,
  CreateQuestionOptionInput,
  CreateUserAnswerInput,
  UpdateQuizInput,
  QuizRow,
  TopicRow,
  QuestionRow,
  QuestionOptionRow,
} from '../types/shared.types';
import { Logger } from '@nestjs/common';

// Mock fetch globally
global.fetch = jest.fn();

describe('QuizService', () => {
  let service: QuizService;
  let databaseService: jest.Mocked<DatabaseService>;

  const mockQuiz: QuizRow = {
    quiz_id: 'quiz-123',
    title: 'Test Quiz',
    description: 'A test quiz',
    user_id: 'user-123',
    topic_id: 'topic-123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockTopic: TopicRow = {
    topic_id: 'topic-123',
    name: 'Test Topic',
    description: 'A test topic',
    parent_topic_id: null,
  };

  const mockQuestion: QuestionRow = {
    question_id: 'question-123',
    content: 'What is 2+2?',
    question_type: 'multiple-choice',
    difficulty: 1,
    topic_id: 'topic-123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockQuestionOption: QuestionOptionRow = {
    option_id: 'option-123',
    question_id: 'question-123',
    content: '4',
    is_correct: true,
  };

  const mockQuizWithQuestions: QuizWithQuestions = {
    ...mockQuiz,
    questions: [
      {
        ...mockQuestion,
        question_options: [mockQuestionOption],
      },
    ],
  };

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => { });
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => { });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: DatabaseService,
          useValue: {
            getUserQuizzes: jest.fn(),
            getUserQuizAttempts: jest.fn(),
            getQuizWithQuestions: jest.fn(),
            submitAnswer: jest.fn(),
            createQuiz: jest.fn(),
            createTopic: jest.fn(),
            createQuestion: jest.fn(),
            createQuestionOption: jest.fn(),
            createExplanation: jest.fn(),
            addQuestionsToQuiz: jest.fn(),
            deleteQuiz: jest.fn(),
            getQuizReview: jest.fn(),
            updateQuiz: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    databaseService = module.get(DatabaseService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getUserQuizzes', () => {
    it('should return user quizzes successfully', async () => {
      const mockResponse: ApiResponse<QuizRow[]> = {
        success: true,
        data: [mockQuiz],
        error: null,
      };

      databaseService.getUserQuizzes.mockResolvedValue(mockResponse);

      const result = await service.getUserQuizzes('user-123');

      expect(databaseService.getUserQuizzes).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when getting user quizzes', async () => {
      const mockResponse: ApiResponse<QuizRow[]> = {
        success: false,
        data: null,
        error: 'Database error',
      };

      databaseService.getUserQuizzes.mockResolvedValue(mockResponse);

      const result = await service.getUserQuizzes('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getUserQuizAttempts', () => {
    it('should return user quiz attempts successfully', async () => {
      const mockAttempts = [
        {
          quiz_id: 'quiz-123',
          title: 'Test Quiz',
          score: 80,
          completed_at: '2023-01-01T00:00:00Z',
        },
      ];

      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: mockAttempts,
        error: null,
      };

      databaseService.getUserQuizAttempts.mockResolvedValue(mockResponse);

      const result = await service.getUserQuizAttempts('user-123');

      expect(databaseService.getUserQuizAttempts).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getQuizWithQuestions', () => {
    it('should return quiz with questions successfully', async () => {
      const mockResponse: ApiResponse<QuizWithQuestions> = {
        success: true,
        data: mockQuizWithQuestions,
        error: null,
      };

      databaseService.getQuizWithQuestions.mockResolvedValue(mockResponse);

      const result = await service.getQuizWithQuestions('quiz-123');

      expect(databaseService.getQuizWithQuestions).toHaveBeenCalledWith('quiz-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('submitAnswer', () => {
    it('should submit answer successfully', async () => {
      const submitAnswerDto = {
        question_id: 'question-123',
        quiz_id: 'quiz-123',
        selected_option_id: 'option-123',
        text_answer: undefined,
        is_correct: true,
        time_taken_seconds: 30,
      };

      const mockResponse: ApiResponse<any> = {
        success: true,
        data: { answer_id: 'answer-123' },
        error: null,
      };

      databaseService.submitAnswer.mockResolvedValue(mockResponse);

      const result = await service.submitAnswer(submitAnswerDto, 'user-123');

      expect(databaseService.submitAnswer).toHaveBeenCalledWith({
        user_id: 'user-123',
        question_id: submitAnswerDto.question_id,
        quiz_id: submitAnswerDto.quiz_id,
        selected_option_id: submitAnswerDto.selected_option_id,
        text_answer: submitAnswerDto.text_answer,
        is_correct: submitAnswerDto.is_correct,
        time_taken_seconds: submitAnswerDto.time_taken_seconds,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createQuiz', () => {
    it('should create quiz successfully', async () => {
      const createQuizDto: CreateQuizDto = {
        title: 'New Quiz',
        description: 'A new quiz',
        topic_id: 'topic-123',
      };

      const mockResponse: ApiResponse<QuizRow> = {
        success: true,
        data: mockQuiz,
        error: null,
      };

      databaseService.createQuiz.mockResolvedValue(mockResponse);

      const result = await service.createQuiz(createQuizDto, 'user-123');

      expect(databaseService.createQuiz).toHaveBeenCalledWith({
        user_id: 'user-123',
        title: createQuizDto.title,
        description: createQuizDto.description,
        topic_id: createQuizDto.topic_id,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateQuiz', () => {
    const generateQuizDto: GenerateQuizDto = {
      title: 'AI Generated Quiz',
      description: 'An AI generated quiz',
      topic_name: 'JavaScript',
      difficulty: 3,
      num_questions: 5,
      question_types: ['multiple-choice'],
    };

    beforeEach(() => {
      // Mock environment variables
      process.env.OPENROUTER_API_KEY = 'test-api-key';
    });

    afterEach(() => {
      delete process.env.OPENROUTER_API_KEY;
    });

    it('should generate quiz with existing topic successfully', async () => {
      const mockQuizResponse: ApiResponse<QuizRow> = {
        success: true,
        data: mockQuiz,
        error: null,
      };

      const mockQuestionResponse: ApiResponse<QuestionRow> = {
        success: true,
        data: mockQuestion,
        error: null,
      };

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                questions: [
                  {
                    question: 'What is 2+2?',
                    type: 'multiple-choice',
                    options: ['3', '4', '5', '6'],
                    correct_answer: 1,
                    explanation: '2+2 equals 4',
                    difficulty: 1,
                  },
                ],
              }),
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockAIResponse),
      });

      databaseService.createQuiz.mockResolvedValue(mockQuizResponse);
      databaseService.createQuestion.mockResolvedValue(mockQuestionResponse);
      databaseService.createQuestionOption.mockResolvedValue({
        success: true,
        data: mockQuestionOption,
        error: null,
      });
      databaseService.createExplanation.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });
      databaseService.addQuestionsToQuiz.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      const result = await service.generateQuiz(generateQuizDto, 'user-123');

      expect(result.success).toBe(true);
      expect(result.data?.quiz).toEqual(mockQuiz);
      expect(result.data?.questions_created).toBe(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      );
    });

    it('should generate quiz with custom topic successfully', async () => {
      const customTopicDto = {
        ...generateQuizDto,
        topic_id: undefined,
        custom_topic: 'Custom Topic',
      };

      const mockTopicResponse: ApiResponse<TopicRow> = {
        success: true,
        data: mockTopic,
        error: null,
      };

      const mockQuizResponse: ApiResponse<QuizRow> = {
        success: true,
        data: mockQuiz,
        error: null,
      };

      const mockQuestionResponse: ApiResponse<QuestionRow> = {
        success: true,
        data: mockQuestion,
        error: null,
      };

      const mockAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                questions: [
                  {
                    question: 'What is 2+2?',
                    type: 'multiple-choice',
                    options: ['3', '4', '5', '6'],
                    correct_answer: 1,
                    explanation: '2+2 equals 4',
                    difficulty: 1,
                  },
                ],
              }),
            },
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockAIResponse),
      });

      databaseService.createTopic.mockResolvedValue(mockTopicResponse);
      databaseService.createQuiz.mockResolvedValue(mockQuizResponse);
      databaseService.createQuestion.mockResolvedValue(mockQuestionResponse);
      databaseService.createQuestionOption.mockResolvedValue({
        success: true,
        data: mockQuestionOption,
        error: null,
      });
      databaseService.createExplanation.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });
      databaseService.addQuestionsToQuiz.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      const result = await service.generateQuiz(customTopicDto, 'user-123');

      expect(databaseService.createTopic).toHaveBeenCalledWith({
        name: 'Custom Topic',
        description: 'Custom topic: Custom Topic',
      });
      expect(result.success).toBe(true);
    });

    it('should handle AI API failure gracefully', async () => {
      const mockQuizResponse: ApiResponse<QuizRow> = {
        success: true,
        data: mockQuiz,
        error: null,
      };

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      databaseService.createQuiz.mockResolvedValue(mockQuizResponse);
      databaseService.deleteQuiz.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      const result = await service.generateQuiz(generateQuizDto, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI did not return any questions. Please try again.');
      expect(databaseService.deleteQuiz).toHaveBeenCalledWith(mockQuiz.quiz_id);
    });

    it('should handle missing OpenRouter API key', async () => {
      delete process.env.OPENROUTER_API_KEY;

      const mockQuizResponse: ApiResponse<QuizRow> = {
        success: true,
        data: mockQuiz,
        error: null,
      };

      databaseService.createQuiz.mockResolvedValue(mockQuizResponse);
      databaseService.deleteQuiz.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      const result = await service.generateQuiz(generateQuizDto, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI did not return any questions. Please try again.');
    });

    it('should handle quiz creation failure', async () => {
      const mockQuizResponse: ApiResponse<QuizRow> = {
        success: false,
        data: null,
        error: 'Failed to create quiz',
      };

      databaseService.createQuiz.mockResolvedValue(mockQuizResponse);

      const result = await service.generateQuiz(generateQuizDto, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create quiz');
    });

    it('should handle topic creation failure', async () => {
      const customTopicDto = {
        ...generateQuizDto,
        topic_id: undefined,
        custom_topic: 'Custom Topic',
      };

      const mockTopicResponse: ApiResponse<TopicRow> = {
        success: false,
        data: null,
        error: 'Failed to create topic',
      };

      databaseService.createTopic.mockResolvedValue(mockTopicResponse);

      const result = await service.generateQuiz(customTopicDto, 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create topic');
    });
  });

  describe('deleteQuiz', () => {
    it('should delete quiz successfully', async () => {
      const mockResponse: ApiResponse<null> = {
        success: true,
        data: null,
        error: null,
      };

      databaseService.deleteQuiz.mockResolvedValue(mockResponse);

      const result = await service.deleteQuiz('quiz-123');

      expect(databaseService.deleteQuiz).toHaveBeenCalledWith('quiz-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getQuizReview', () => {
    it('should get quiz review successfully', async () => {
      const mockReview = {
        quiz_id: 'quiz-123',
        total_questions: 10,
        correct_answers: 8,
        score: 80,
      };

      const mockResponse: ApiResponse<any> = {
        success: true,
        data: mockReview,
        error: null,
      };

      databaseService.getQuizReview.mockResolvedValue(mockResponse);

      const result = await service.getQuizReview('quiz-123', 'user-123');

      expect(databaseService.getQuizReview).toHaveBeenCalledWith('quiz-123', 'user-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateQuiz', () => {
    it('should update quiz successfully', async () => {
      const updateInput: UpdateQuizInput = {
        title: 'Updated Quiz Title',
        description: 'Updated description',
      };

      const mockResponse: ApiResponse<QuizRow> = {
        success: true,
        data: { ...mockQuiz, ...updateInput },
        error: null,
      };

      databaseService.updateQuiz.mockResolvedValue(mockResponse);

      const result = await service.updateQuiz('quiz-123', updateInput);

      expect(databaseService.updateQuiz).toHaveBeenCalledWith('quiz-123', updateInput);
      expect(result).toEqual(mockResponse);
    });
  });
});
