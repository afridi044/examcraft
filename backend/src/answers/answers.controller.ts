import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnswersService } from './answers.service';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Answers')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get authenticated user answers with optional filters' })
  getUserAnswers(
    @User() user: AuthUser,
    @Query('quizId') quizId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('topicId') topicId?: string,
  ) {
    const filters = { quizId, sessionId, topicId };
    return this.answersService.getUserAnswers(user.id, filters);
  }
}
