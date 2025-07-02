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

interface SubmitAnswerDto {
  user_id: string;
  question_id: string;
  quiz_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  time_taken_seconds: number;
}

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

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all quizzes for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({
    status: 200,
    description: 'User quizzes retrieved successfully',
  })
  async getUserQuizzes(@Param('userId') userId: string) {
    this.logger.log(`📚 Getting quizzes for user: ${userId}`);
    return await this.quizService.getUserQuizzes(userId);
  }

  @Get('user-attempts/:userId')
  @ApiOperation({ summary: 'Get quiz attempts/history for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({
    status: 200,
    description: 'User quiz attempts retrieved successfully',
  })
  async getUserQuizAttempts(@Param('userId') userId: string) {
    this.logger.log(`📊 Getting quiz attempts for user: ${userId}`);
    return await this.quizService.getUserQuizAttempts(userId);
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
  async submitAnswer(@Body() submitAnswerDto: SubmitAnswerDto) {
    this.logger.log(
      `📝 Submitting answer for question: ${submitAnswerDto.question_id}`,
    );
    return await this.quizService.submitAnswer(submitAnswerDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    this.logger.log(`✨ Creating quiz: ${createQuizDto.title}`);
    return await this.quizService.createQuiz(createQuizDto);
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
  async generateQuiz(@Body() generateQuizDto: GenerateQuizDto) {
    this.logger.log(`🤖 Generating AI quiz: ${generateQuizDto.title}`);
    return await this.quizService.generateQuiz(generateQuizDto);
  }

  @Get('review/:quizId/:userId')
  @ApiOperation({ summary: 'Get detailed review data for a quiz by user' })
  @ApiParam({ name: 'quizId', description: 'Quiz ID', example: 'uuid-quiz-id' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({
    status: 200,
    description: 'Quiz review data retrieved successfully',
  })
  async getQuizReview(
    @Param('quizId') quizId: string,
    @Param('userId') userId: string,
  ) {
    this.logger.log(
      `🧐 Getting quiz review: quiz ${quizId} for user ${userId}`,
    );
    return await this.quizService.getQuizReview(quizId, userId);
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
