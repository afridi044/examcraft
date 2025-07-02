import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnswersService } from './answers.service';

@ApiTags('Answers')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user answers with optional filters' })
  getUserAnswers(
    @Param('userId') userId: string,
    @Query('quizId') quizId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('topicId') topicId?: string,
  ) {
    const filters = { quizId, sessionId, topicId };
    return this.answersService.getUserAnswers(userId, filters);
  }
}
