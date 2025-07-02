import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
  Post,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionInput,
  CreateQuestionOptionInput,
} from '../types/shared.types';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all questions (with optional filters)' })
  async getAll(
    @Query('topicId') topicId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: {
      topicId?: string;
      difficulty?: number;
      questionType?: string;
      limit?: number;
    } = {};

    if (topicId) filters.topicId = topicId;
    if (difficulty) filters.difficulty = Number(difficulty);
    if (type) filters.questionType = type;
    if (limit) filters.limit = Number(limit);

    const res = await this.questionsService.getQuestions(filters);
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  async getById(@Param('id') id: string) {
    const res = await this.questionsService.getQuestionById(id);
    if (!res.success) throw new NotFoundException(res.error);
    return res;
  }

  @Post()
  @ApiOperation({ summary: 'Create question with options' })
  async createQuestion(
    @Body()
    body: {
      question: CreateQuestionInput;
      options: CreateQuestionOptionInput[];
    },
  ) {
    const { question, options } = body;
    const res = await this.questionsService.createQuestionWithOptions(
      question,
      options,
    );
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }
}
