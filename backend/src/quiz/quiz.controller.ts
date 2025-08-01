import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
  private readonly logger = new Logger(QuizController.name);

  constructor(private readonly quizService: QuizService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test() {
    this.logger.log('🧪 Quiz controller test endpoint called');
    return { success: true, message: 'Quiz controller is working!' };
  }

  @Get('user')
  @ApiOperation({ summary: 'Get all quizzes for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User quizzes retrieved successfully',
  })
  async getUserQuizzes(@User() user: AuthUser) {
    this.logger.log(`📚 Getting quizzes for user: ${user.id}`);
    return await this.quizService.getUserQuizzes(user.id);
  }

  @Get('user-attempts')
  @ApiOperation({ summary: 'Get quiz attempts/history for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User quiz attempts retrieved successfully',
  })
  async getUserQuizAttempts(@User() user: AuthUser) {
    this.logger.log(`📊 Getting quiz attempts for user: ${user.id}`);
    return await this.quizService.getUserQuizAttempts(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search quizzes for the authenticated user' })
  @ApiQuery({ name: 'q', description: 'Search query', example: 'JavaScript' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchQuizzes(@Query('q') query: string, @User() user: AuthUser) {
    this.logger.log(`🔍 Searching quizzes for user: ${user.id}, query: ${query}`);
    return await this.quizService.searchQuizzes(query, user.id);
  }

  @Get(':quizId')
  @ApiOperation({ summary: 'Get quiz with questions by ID' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID', example: 'uuid-quiz-id' })
  @ApiResponse({ status: 200, description: 'Quiz retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizWithQuestions(@Param('quizId') quizId: string) {
    this.logger.log(`🔍 Getting quiz with questions: ${quizId}`);
    return await this.quizService.getQuizWithQuestions(quizId);
  }

  @Post('submit-answer')
  @ApiOperation({ summary: 'Submit an answer for a quiz question' })
  @ApiResponse({ status: 201, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async submitAnswer(@Body() submitAnswerDto: SubmitAnswerDto, @User() user: AuthUser) {
    this.logger.log(
      `📝 Submitting answer for question: ${submitAnswerDto.question_id}`,
    );
    return await this.quizService.submitAnswer(submitAnswerDto, user.id);
  }

  @Post('complete-quiz')
  @ApiOperation({ summary: 'Mark a quiz as completed' })
  @ApiResponse({ status: 201, description: 'Quiz marked as completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async completeQuiz(
    @Body() completionData: {
      quizId: string;
      totalQuestions: number;
      answeredQuestions: number;
      correctAnswers: number;
      scorePercentage: number;
      timeSpentSeconds: number;
      wasAutoSubmitted: boolean;
    },
    @User() user: AuthUser
  ) {
    this.logger.log(`🏁 Marking quiz as completed: ${completionData.quizId}`);
    return await this.quizService.recordQuizCompletion(user.id, completionData.quizId, {
      totalQuestions: completionData.totalQuestions,
      answeredQuestions: completionData.answeredQuestions,
      correctAnswers: completionData.correctAnswers,
      scorePercentage: completionData.scorePercentage,
      timeSpentSeconds: completionData.timeSpentSeconds,
      wasAutoSubmitted: completionData.wasAutoSubmitted,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createQuiz(@Body() createQuizDto: CreateQuizDto, @User() user: AuthUser) {
    this.logger.log(`✨ Creating quiz: ${createQuizDto.title}`);
    return await this.quizService.createQuiz(createQuizDto, user.id);
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Generate quiz using AI',
    description:
      'Creates a new quiz with AI-generated questions based on the provided parameters',
  })
  @ApiResponse({
    status: 201,
    description: 'Quiz generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            quiz: { type: 'object' },
            questions_created: { type: 'number' },
            message: { type: 'string' },
          },
        },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'AI generation failed' })
  async generateQuiz(@Body() generateQuizDto: GenerateQuizDto, @User() user: AuthUser) {
    this.logger.log(`🤖 Generating AI quiz: ${generateQuizDto.title}`);
    return await this.quizService.generateQuiz(generateQuizDto, user.id);
  }

  @Get('review/:quizId')
  @ApiOperation({ summary: 'Get detailed review data for a quiz for authenticated user' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID', example: 'uuid-quiz-id' })
  @ApiResponse({
    status: 200,
    description: 'Quiz review data retrieved successfully',
  })
  async getQuizReview(
    @Param('quizId') quizId: string,
    @User() user: AuthUser,
  ) {
    this.logger.log(
      `🧐 Getting quiz review: quiz ${quizId} for user ${user.id}`,
    );
    return await this.quizService.getQuizReview(quizId, user.id);
  }

  @Delete(':quizId')
  async deleteQuiz(@Param('quizId') quizId: string) {
    return await this.quizService.deleteQuiz(quizId);
  }

  @Patch(':quizId')
  @ApiOperation({ summary: 'Update quiz (stub)' })
  async updateQuiz(@Param('quizId') quizId: string, @Body() body: any) {
    return await this.quizService.updateQuiz(quizId, body);
  }
}
