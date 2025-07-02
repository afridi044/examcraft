import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { GenerateExamDto } from './dto/generate-exam.dto';
import { ExamResponseDto, ExamListResponseDto } from './dto/exam-response.dto';

@ApiTags('Exams')
@Controller('exams')
@UsePipes(new ValidationPipe({ transform: true }))
export class ExamsController {
  private readonly logger = new Logger(ExamsController.name);
  
  constructor(private readonly examsService: ExamsService) {}

  // =============================================
  // Exam Management
  // =============================================

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get exams for user',
    description: 'Retrieve all exams created by a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user-uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Exams retrieved successfully',
    type: [ExamListResponseDto],
  })
  async getUserExams(@Param('userId') userId: string) {
    return await this.examsService.getUserExams(userId);
  }

  @Get(':examId')
  @ApiOperation({
    summary: 'Get exam with questions',
    description: 'Retrieve a specific exam with all its questions and details',
  })
  @ApiParam({
    name: 'examId',
    description: 'Exam ID',
    example: 'exam-uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam retrieved successfully',
    type: ExamResponseDto,
  })
  async getExam(@Param('examId') examId: string) {
    return await this.examsService.getExamById(examId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create exam',
    description: 'Create a new timed exam with questions',
  })
  @ApiBody({ type: CreateExamDto })
  @ApiResponse({
    status: 201,
    description: 'Exam created successfully',
    type: ExamResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createExam(@Body() createExamDto: CreateExamDto) {
    return await this.examsService.createExam(createExamDto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI-powered exam' })
  @ApiResponse({
    status: 201,
    description: 'AI exam generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            exam: { $ref: '#/components/schemas/ExamResponseDto' },
            questions: { type: 'array', items: { type: 'object' } },
          },
        },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'AI generation failed' })
  @ApiBody({ type: GenerateExamDto })
  async generateExam(@Body() generateExamDto: GenerateExamDto) {
    this.logger.log(`🤖 Generating AI exam: ${generateExamDto.title}`);
    return await this.examsService.generateExam(generateExamDto);
  }

  @Put(':examId')
  @ApiOperation({
    summary: 'Update exam',
    description: 'Update an existing exam',
  })
  @ApiParam({
    name: 'examId',
    description: 'Exam ID',
    example: 'exam-uuid-here',
  })
  @ApiBody({ type: UpdateExamDto })
  @ApiResponse({
    status: 200,
    description: 'Exam updated successfully',
    type: ExamResponseDto,
  })
  async updateExam(
    @Param('examId') examId: string,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return await this.examsService.updateExam(examId, updateExamDto);
  }

  @Delete(':examId')
  @ApiOperation({
    summary: 'Delete exam',
    description: 'Delete an exam and all associated data',
  })
  @ApiParam({
    name: 'examId',
    description: 'Exam ID',
    example: 'exam-uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam deleted successfully',
  })
  async deleteExam(@Param('examId') examId: string) {
    return await this.examsService.deleteExam(examId);
  }

  // =============================================
  // Exam Sessions
  // =============================================

  @Get('sessions/user/:userId')
  @ApiOperation({
    summary: 'Get exam sessions for user',
    description: 'Retrieve all exam sessions (attempts) for a user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user-uuid-here',
  })
  @ApiQuery({
    name: 'examId',
    description: 'Filter by specific exam ID',
    required: false,
    example: 'exam-uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam sessions retrieved successfully',
  })
  async getUserExamSessions(
    @Param('userId') userId: string,
    @Query('examId') examId?: string,
  ) {
    return await this.examsService.getUserExamSessions(userId, examId);
  }

  @Post('sessions/start')
  @ApiOperation({
    summary: 'Start exam session',
    description: 'Start a new timed exam session',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        examId: {
          type: 'string',
          example: 'exam-uuid-here',
          description: 'Exam ID to start',
        },
        userId: {
          type: 'string',
          example: 'user-uuid-here',
          description: 'User ID starting the exam',
        },
      },
      required: ['examId', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Exam session started successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async startExamSession(
    @Body() body: { examId: string; userId: string },
  ) {
    return await this.examsService.startExamSession(body.examId, body.userId);
  }

  @Put('sessions/:sessionId/end')
  @ApiOperation({
    summary: 'End exam session',
    description: 'End an exam session and calculate final score',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'session-uuid-here',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        totalScore: {
          type: 'number',
          example: 85,
          description: 'Final calculated score',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Exam session ended successfully',
  })
  async endExamSession(
    @Param('sessionId') sessionId: string,
    @Body() body: { totalScore?: number },
  ) {
    return await this.examsService.endExamSession(sessionId, body.totalScore);
  }

  @Put('sessions/:sessionId/timeout')
  @ApiOperation({
    summary: 'Timeout exam session',
    description: 'Mark an exam session as timed out when timer expires',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'session-uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam session timed out successfully',
  })
  async timeoutExamSession(@Param('sessionId') sessionId: string) {
    return await this.examsService.timeoutExamSession(sessionId);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({
    summary: 'Get exam session',
    description: 'Retrieve details of a specific exam session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'session-uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam session retrieved successfully',
  })
  async getExamSession(@Param('sessionId') sessionId: string) {
    return await this.examsService.getExamSession(sessionId);
  }

  // =============================================
  // Exam Answers
  // =============================================

  @Post('sessions/:sessionId/answers')
  @ApiOperation({
    summary: 'Submit exam answer',
    description: 'Submit an answer for a question in an exam session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'session-uuid-here',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        questionId: {
          type: 'string',
          example: 'question-uuid-here',
          description: 'Question ID being answered',
        },
        userId: {
          type: 'string',
          example: 'user-uuid-here',
          description: 'User ID submitting the answer',
        },
        selectedOptionId: {
          type: 'string',
          example: 'option-uuid-here',
          description: 'Selected option ID (for multiple choice)',
        },
        textAnswer: {
          type: 'string',
          example: 'Paris',
          description: 'Text answer (for fill-in-blank)',
        },
        isCorrect: {
          type: 'boolean',
          example: true,
          description: 'Whether the answer is correct',
        },
        timeTakenSeconds: {
          type: 'number',
          example: 45,
          description: 'Time taken to answer in seconds',
        },
      },
      required: ['questionId', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Answer submitted successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async submitExamAnswer(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      questionId: string;
      userId: string;
      selectedOptionId?: string;
      textAnswer?: string;
      isCorrect?: boolean;
      timeTakenSeconds?: number;
    },
  ) {
    return await this.examsService.submitExamAnswer(
      sessionId,
      body.questionId,
      body.userId,
      body.selectedOptionId,
      body.textAnswer,
      body.isCorrect,
      body.timeTakenSeconds,
    );
  }
}
