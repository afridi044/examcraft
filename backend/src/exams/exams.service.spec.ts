import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { DatabaseService } from '../database/database.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { GenerateExamDto } from './dto/generate-exam.dto';
import type {
  ApiResponse,
  ExamRow,
  ExamSessionRow,
  ExamInsert,
  ExamSessionInsert,
} from '../types/shared.types';

// Mock fetch globally
global.fetch = jest.fn();

describe('ExamsService', () => {
  let service: ExamsService;
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
        ExamsService,
        {
          provide: DatabaseService,
          useValue: {
            getUserExams: jest.fn(),
            getExamById: jest.fn(),
            createExam: jest.fn(),
            updateExam: jest.fn(),
            deleteExam: jest.fn(),
            getExamSessions: jest.fn(),
            createExamSession: jest.fn(),
            updateExamSession: jest.fn(),
            getExamSessionById: jest.fn(),
            submitAnswer: jest.fn(),
            createTopic: jest.fn(),
            deleteTopic: jest.fn(),
            createQuestion: jest.fn(),
            createQuestionOption: jest.fn(),
            createExplanation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
    databaseService = module.get(DatabaseService);

    // Mock the logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserExams', () => {
    it('should get user exams successfully', async () => {
      const userId = 'user-123';
      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: [{ exam_id: 'exam-1', title: 'Test Exam' }],
        error: null,
      };

      databaseService.getUserExams.mockResolvedValue(mockResponse);

      const result = await service.getUserExams(userId);

      expect(databaseService.getUserExams).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`📚 Getting exams for user: ${userId}`);
    });

    it('should handle database error', async () => {
      const userId = 'user-123';
      const mockResponse: ApiResponse<any[]> = {
        success: false,
        data: null,
        error: 'Database error',
      };

      databaseService.getUserExams.mockResolvedValue(mockResponse);

      const result = await service.getUserExams(userId);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getExamById', () => {
    it('should get exam by ID successfully', async () => {
      const examId = 'exam-123';
      const mockResponse: ApiResponse<any> = {
        success: true,
        data: { exam_id: examId, title: 'Test Exam' },
        error: null,
      };

      databaseService.getExamById.mockResolvedValue(mockResponse);

      const result = await service.getExamById(examId);

      expect(databaseService.getExamById).toHaveBeenCalledWith(examId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`🔍 Getting exam: ${examId}`);
    });
  });

  describe('createExam', () => {
    it('should create exam successfully', async () => {
      const createExamDto: CreateExamDto = {
        user_id: 'user-123',
        title: 'Test Exam',
        description: 'Test Description',
        duration_minutes: 60,
        passing_score: 70,
        topic_id: 'topic-123',
        question_ids: ['question-1', 'question-2'],
      };

      const mockExam: ExamRow = {
        exam_id: 'exam-123',
        user_id: 'user-123',
        title: 'Test Exam',
        description: 'Test Description',
        duration_minutes: 60,
        passing_score: 70,
        topic_id: 'topic-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockResponse: ApiResponse<ExamRow> = {
        success: true,
        data: mockExam,
        error: null,
      };

      databaseService.createExam.mockResolvedValue(mockResponse);

      const result = await service.createExam(createExamDto);

      expect(databaseService.createExam).toHaveBeenCalledWith(
        {
          user_id: createExamDto.user_id,
          title: createExamDto.title,
          description: createExamDto.description,
          duration_minutes: createExamDto.duration_minutes,
          passing_score: createExamDto.passing_score,
          topic_id: createExamDto.topic_id,
        },
        createExamDto.question_ids,
      );
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`✨ Creating exam: ${createExamDto.title}`);
    });
  });

  describe('generateExam', () => {
    const generateExamDto: GenerateExamDto = {
      user_id: 'user-123',
      title: 'AI Generated Exam',
      description: 'AI generated exam',
      topic_name: 'Mathematics',
      difficulty: 3,
      num_questions: 10,
      duration_minutes: 60,
      passing_score: 70,
      question_types: ['multiple-choice', 'true-false'],
      content_source: 'Textbook chapter 1',
      additional_instructions: 'Focus on algebra',
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
                  correct_answer_index: 1,
                  explanation: '2+2 equals 4',
                },
              ],
            }),
          },
        },
      ],
    };

    beforeEach(() => {
      // Mock environment variable
      process.env.OPENROUTER_API_KEY = 'test-api-key';
    });

    it('should generate exam successfully with existing topic', async () => {
      const mockExam: ExamRow = {
        exam_id: 'exam-123',
        user_id: 'user-123',
        title: 'AI Generated Exam',
        description: 'AI generated exam',
        duration_minutes: 60,
        passing_score: 70,
        topic_id: 'topic-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockQuestion = {
        question_id: 'question-123',
        content: 'What is 2+2?',
        question_type: 'multiple-choice',
        difficulty: 3,
        topic_id: 'topic-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      databaseService.createExam.mockResolvedValue({
        success: true,
        data: mockExam,
        error: null,
      });

      databaseService.createQuestion.mockResolvedValue({
        success: true,
        data: mockQuestion,
        error: null,
      });

      databaseService.createQuestionOption.mockResolvedValue({
        success: true,
        data: { 
          option_id: 'option-123',
          content: '4',
          is_correct: true,
          question_id: 'question-123'
        },
        error: null,
      });

      databaseService.createExplanation.mockResolvedValue({
        success: true,
        data: { 
          explanation_id: 'explanation-123',
          content: '2+2 equals 4',
          ai_generated: true,
          question_id: 'question-123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null,
      });

      databaseService.getExamById.mockResolvedValue({
        success: true,
        data: { ...mockExam, questions: [] },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAIResponse),
      });

      const result = await service.generateExam(generateExamDto);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('exam');
      expect(result.data).toHaveProperty('questions');
      expect(mockLogger.log).toHaveBeenCalledWith(`🤖 Generating AI exam: ${generateExamDto.title}`);
    });

    it('should generate exam with custom topic creation', async () => {
      const dtoWithCustomTopic = {
        ...generateExamDto,
        topic_id: undefined,
        custom_topic: 'Custom Mathematics',
      };

      const mockTopic = {
        topic_id: 'new-topic-123',
        name: 'Custom Mathematics',
        description: 'Custom topic: Custom Mathematics',
        parent_topic_id: null,
      };

      const mockExam: ExamRow = {
        exam_id: 'exam-123',
        user_id: 'user-123',
        title: 'AI Generated Exam',
        description: 'AI generated exam',
        duration_minutes: 60,
        passing_score: 70,
        topic_id: 'new-topic-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      databaseService.createTopic.mockResolvedValue({
        success: true,
        data: mockTopic,
        error: null,
      });

      databaseService.createExam.mockResolvedValue({
        success: true,
        data: mockExam,
        error: null,
      });

      databaseService.createQuestion.mockResolvedValue({
        success: true,
        data: { 
          question_id: 'question-123',
          content: 'What is 2+2?',
          question_type: 'multiple-choice',
          difficulty: 3,
          topic_id: 'new-topic-123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null,
      });

      databaseService.createQuestionOption.mockResolvedValue({
        success: true,
        data: { 
          option_id: 'option-123',
          content: '4',
          is_correct: true,
          question_id: 'question-123'
        },
        error: null,
      });

      databaseService.createExplanation.mockResolvedValue({
        success: true,
        data: { 
          explanation_id: 'explanation-123',
          content: '2+2 equals 4',
          ai_generated: true,
          question_id: 'question-123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null,
      });

      databaseService.getExamById.mockResolvedValue({
        success: true,
        data: { ...mockExam, questions: [] },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAIResponse),
      });

      const result = await service.generateExam(dtoWithCustomTopic);

      expect(result.success).toBe(true);
      expect(databaseService.createTopic).toHaveBeenCalledWith({
        name: 'Custom Mathematics',
        description: 'Custom topic: Custom Mathematics',
      });
    });

    it('should handle AI API error', async () => {
      databaseService.createExam.mockResolvedValue({
        success: true,
        data: { exam_id: 'exam-123' } as ExamRow,
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.generateExam(generateExamDto);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI API error');
      expect(databaseService.deleteExam).toHaveBeenCalledWith('exam-123');
    });

    it('should handle invalid AI response format', async () => {
      databaseService.createExam.mockResolvedValue({
        success: true,
        data: { exam_id: 'exam-123' } as ExamRow,
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Invalid JSON' } }],
        }),
      });

      const result = await service.generateExam(generateExamDto);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unexpected token');
    });

    it('should handle empty AI questions', async () => {
      databaseService.createExam.mockResolvedValue({
        success: true,
        data: { exam_id: 'exam-123' } as ExamRow,
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({ questions: [] }),
              },
            },
          ],
        }),
      });

      const result = await service.generateExam(generateExamDto);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI failed to generate questions');
    });

    it('should handle exam creation failure', async () => {
      databaseService.createExam.mockResolvedValue({
        success: false,
        data: null,
        error: 'Failed to create exam',
      });

      const result = await service.generateExam(generateExamDto);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create exam');
    });

    it('should clean up orphan data on failure', async () => {
      const mockExam: ExamRow = {
        exam_id: 'exam-123',
        user_id: 'user-123',
        title: 'AI Generated Exam',
        description: 'AI generated exam',
        duration_minutes: 60,
        passing_score: 70,
        topic_id: 'topic-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      databaseService.createExam.mockResolvedValue({
        success: true,
        data: mockExam,
        error: null,
      });

      databaseService.createQuestion.mockRejectedValue(new Error('Question creation failed'));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAIResponse),
      });

      const result = await service.generateExam(generateExamDto);

      expect(result.success).toBe(false);
      expect(databaseService.deleteExam).toHaveBeenCalledWith('exam-123');
    });
  });

  describe('updateExam', () => {
    it('should update exam successfully', async () => {
      const examId = 'exam-123';
      const updateExamDto: UpdateExamDto = {
        title: 'Updated Exam',
        description: 'Updated description',
        duration_minutes: 90,
        passing_score: 80,
        topic_id: 'topic-456',
        question_ids: ['question-3', 'question-4'],
      };

      const mockExam: ExamRow = {
        exam_id: examId,
        user_id: 'user-123',
        title: 'Updated Exam',
        description: 'Updated description',
        duration_minutes: 90,
        passing_score: 80,
        topic_id: 'topic-456',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockResponse: ApiResponse<ExamRow> = {
        success: true,
        data: mockExam,
        error: null,
      };

      databaseService.updateExam.mockResolvedValue(mockResponse);

      const result = await service.updateExam(examId, updateExamDto);

      expect(databaseService.updateExam).toHaveBeenCalledWith(
        examId,
        {
          title: updateExamDto.title,
          description: updateExamDto.description,
          duration_minutes: updateExamDto.duration_minutes,
          passing_score: updateExamDto.passing_score,
          topic_id: updateExamDto.topic_id,
        },
        updateExamDto.question_ids,
      );
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`📝 Updating exam: ${examId}`);
    });

    it('should filter out undefined values', async () => {
      const examId = 'exam-123';
      const updateExamDto: UpdateExamDto = {
        title: 'Updated Exam',
        description: undefined,
        duration_minutes: undefined,
        passing_score: 80,
        topic_id: undefined,
        question_ids: ['question-3'],
      };

      databaseService.updateExam.mockResolvedValue({
        success: true,
        data: {} as ExamRow,
        error: null,
      });

      await service.updateExam(examId, updateExamDto);

      expect(databaseService.updateExam).toHaveBeenCalledWith(
        examId,
        {
          title: 'Updated Exam',
          passing_score: 80,
        },
        updateExamDto.question_ids,
      );
    });
  });

  describe('deleteExam', () => {
    it('should delete exam successfully', async () => {
      const examId = 'exam-123';
      const mockResponse: ApiResponse<boolean> = {
        success: true,
        data: true,
        error: null,
      };

      databaseService.deleteExam.mockResolvedValue(mockResponse);

      const result = await service.deleteExam(examId);

      expect(databaseService.deleteExam).toHaveBeenCalledWith(examId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`🗑️ Deleting exam: ${examId}`);
    });
  });

  describe('getUserExamSessions', () => {
    it('should get user exam sessions successfully', async () => {
      const userId = 'user-123';
      const examId = 'exam-123';
      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: [{ session_id: 'session-1', status: 'completed' }],
        error: null,
      };

      databaseService.getExamSessions.mockResolvedValue(mockResponse);

      const result = await service.getUserExamSessions(userId, examId);

      expect(databaseService.getExamSessions).toHaveBeenCalledWith(userId, examId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📊 Getting exam sessions for user: ${userId}, exam: ${examId}`,
      );
    });

    it('should get all user exam sessions when examId is not provided', async () => {
      const userId = 'user-123';
      const mockResponse: ApiResponse<any[]> = {
        success: true,
        data: [{ session_id: 'session-1', status: 'completed' }],
        error: null,
      };

      databaseService.getExamSessions.mockResolvedValue(mockResponse);

      const result = await service.getUserExamSessions(userId);

      expect(databaseService.getExamSessions).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📊 Getting exam sessions for user: ${userId}`,
      );
    });
  });

  describe('startExamSession', () => {
    it('should start exam session successfully', async () => {
      const examId = 'exam-123';
      const userId = 'user-123';

      const mockExam = {
        exam_id: examId,
        title: 'Test Exam',
        duration_minutes: 60,
      };

      const mockSession: ExamSessionRow = {
        session_id: 'session-123',
        exam_id: examId,
        user_id: userId,
        status: 'in_progress',
        start_time: new Date().toISOString(),
        end_time: null,
        total_score: null,
        created_at: new Date().toISOString(),
      };

      databaseService.getExamById.mockResolvedValue({
        success: true,
        data: mockExam,
        error: null,
      });

      databaseService.getExamSessions.mockResolvedValue({
        success: true,
        data: [],
        error: null,
      });

      databaseService.createExamSession.mockResolvedValue({
        success: true,
        data: mockSession,
        error: null,
      });

      const result = await service.startExamSession(examId, userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `🚀 Starting exam session - Exam: ${examId}, User: ${userId}`,
      );
    });

    it('should fail when exam not found', async () => {
      const examId = 'exam-123';
      const userId = 'user-123';

      databaseService.getExamById.mockResolvedValue({
        success: false,
        data: null,
        error: 'Exam not found',
      });

      const result = await service.startExamSession(examId, userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Exam not found');
    });

    it('should fail when user has active session', async () => {
      const examId = 'exam-123';
      const userId = 'user-123';

      const mockExam = {
        exam_id: examId,
        title: 'Test Exam',
        duration_minutes: 60,
      };

      const activeSession = {
        session_id: 'session-123',
        status: 'in_progress',
      };

      databaseService.getExamById.mockResolvedValue({
        success: true,
        data: mockExam,
        error: null,
      });

      databaseService.getExamSessions.mockResolvedValue({
        success: true,
        data: [activeSession],
        error: null,
      });

      const result = await service.startExamSession(examId, userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You already have an active session for this exam');
    });
  });

  describe('endExamSession', () => {
    it('should end exam session successfully', async () => {
      const sessionId = 'session-123';
      const totalScore = 85;

      const mockSession: ExamSessionRow = {
        session_id: sessionId,
        exam_id: 'exam-123',
        user_id: 'user-123',
        status: 'completed',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        total_score: totalScore,
        created_at: new Date().toISOString(),
      };

      databaseService.updateExamSession.mockResolvedValue({
        success: true,
        data: mockSession,
        error: null,
      });

      const result = await service.endExamSession(sessionId, totalScore);

      expect(databaseService.updateExamSession).toHaveBeenCalledWith(sessionId, {
        end_time: expect.any(String),
        status: 'completed',
        total_score: totalScore,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
      expect(mockLogger.log).toHaveBeenCalledWith(`🏁 Ending exam session: ${sessionId}`);
    });

    it('should end exam session without score', async () => {
      const sessionId = 'session-123';

      databaseService.updateExamSession.mockResolvedValue({
        success: true,
        data: {} as ExamSessionRow,
        error: null,
      });

      await service.endExamSession(sessionId);

      expect(databaseService.updateExamSession).toHaveBeenCalledWith(sessionId, {
        end_time: expect.any(String),
        status: 'completed',
        total_score: undefined,
      });
    });
  });

  describe('getExamSession', () => {
    it('should get exam session successfully', async () => {
      const sessionId = 'session-123';
      const mockResponse: ApiResponse<any> = {
        success: true,
        data: { session_id: sessionId, status: 'completed' },
        error: null,
      };

      databaseService.getExamSessionById.mockResolvedValue(mockResponse);

      const result = await service.getExamSession(sessionId);

      expect(databaseService.getExamSessionById).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(`🔍 Getting exam session: ${sessionId}`);
    });
  });

  describe('submitExamAnswer', () => {
    it('should submit exam answer successfully', async () => {
      const sessionId = 'session-123';
      const questionId = 'question-123';
      const userId = 'user-123';
      const selectedOptionId = 'option-123';
      const textAnswer = 'My answer';
      const isCorrect = true;
      const timeTakenSeconds = 30;

      const mockResponse: ApiResponse<any> = {
        success: true,
        data: { answer_id: 'answer-123' },
        error: null,
      };

      databaseService.submitAnswer.mockResolvedValue(mockResponse);

      const result = await service.submitExamAnswer(
        sessionId,
        questionId,
        userId,
        selectedOptionId,
        textAnswer,
        isCorrect,
        timeTakenSeconds,
      );

      expect(databaseService.submitAnswer).toHaveBeenCalledWith({
        user_id: userId,
        question_id: questionId,
        session_id: sessionId,
        selected_option_id: selectedOptionId,
        text_answer: textAnswer,
        is_correct: isCorrect,
        time_taken_seconds: timeTakenSeconds,
      });
      expect(result).toEqual(mockResponse);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📝 Submitting exam answer - Session: ${sessionId}, Question: ${questionId}`,
      );
    });
  });

  describe('timeoutExamSession', () => {
    it('should timeout exam session successfully', async () => {
      const sessionId = 'session-123';

      const mockSession: ExamSessionRow = {
        session_id: sessionId,
        exam_id: 'exam-123',
        user_id: 'user-123',
        status: 'timed_out',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        total_score: null,
        created_at: new Date().toISOString(),
      };

      databaseService.updateExamSession.mockResolvedValue({
        success: true,
        data: mockSession,
        error: null,
      });

      const result = await service.timeoutExamSession(sessionId);

      expect(databaseService.updateExamSession).toHaveBeenCalledWith(sessionId, {
        end_time: expect.any(String),
        status: 'timed_out',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
      expect(mockLogger.log).toHaveBeenCalledWith(`⏰ Timing out exam session: ${sessionId}`);
    });
  });

  describe('private methods', () => {
    describe('buildExamPrompt', () => {
      it('should build correct AI prompt', () => {
        const dto: GenerateExamDto = {
          user_id: 'user-123',
          title: 'Test Exam',
          topic_name: 'Mathematics',
          difficulty: 3,
          num_questions: 10,
          duration_minutes: 60,
          passing_score: 70,
          question_types: ['multiple-choice', 'true-false'],
          content_source: 'Chapter 1',
          additional_instructions: 'Focus on algebra',
        };

        // Access private method through any
        const prompt = (service as any).buildExamPrompt(dto);

        expect(prompt).toContain('Generate 10 multiple-choice, true-false questions');
        expect(prompt).toContain('Mathematics');
        expect(prompt).toContain('difficulty 3/5');
        expect(prompt).toContain('60 minutes');
        expect(prompt).toContain('Chapter 1');
        expect(prompt).toContain('Focus on algebra');
        expect(prompt).toContain('JSON');
      });
    });

    describe('cleanAIResponse', () => {
      it('should clean markdown code blocks from AI response', () => {
        const rawContent = '```json\n{"questions": []}\n```';
        const expected = '{"questions": []}';

        // Access private method through any
        const cleaned = (service as any).cleanAIResponse(rawContent);

        expect(cleaned).toBe(expected);
      });

      it('should handle content without markdown blocks', () => {
        const rawContent = '{"questions": []}';

        // Access private method through any
        const cleaned = (service as any).cleanAIResponse(rawContent);

        expect(cleaned).toBe(rawContent);
      });

      it('should handle content with only opening markdown block', () => {
        const rawContent = '```json\n{"questions": []}';
        const expected = '{"questions": []}';

        // Access private method through any
        const cleaned = (service as any).cleanAIResponse(rawContent);

        expect(cleaned).toBe(expected);
      });
    });
  });
}); 