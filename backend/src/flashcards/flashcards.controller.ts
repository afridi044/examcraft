import {
  Controller,
  Post,
  Body,
  ConflictException,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { CreateFlashcardFromQuestionDto } from './dto/create-from-question.dto';
import { GenerateAiFlashcardsDto } from './dto/generate-ai-flashcards.dto';
import { StudySessionDto } from './dto/study-session.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CheckFlashcardsExistBatchDto } from './dto/check-exists-batch.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Flashcards')
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) { }

  @Post()
  async createFlashcard(@Body() dto: CreateFlashcardDto, @User() user: AuthUser) {
    const result = await this.flashcardsService.createFlashcard(dto, user.id);
    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to create');
    }
    return result;
  }



  @Get('exists/:questionId')
  async checkExists(
    @User() user: AuthUser,
    @Param('questionId') questionId: string,
  ) {
    const exists = await this.flashcardsService.hasFlashcard(
      user.id,
      questionId,
    );
    return { exists };
  }

  @Post('exists-batch')
  async checkExistsBatch(@Body() dto: CheckFlashcardsExistBatchDto, @User() user: AuthUser) {
    const ids = await this.flashcardsService.hasFlashcardsBatch(
      user.id,
      dto.question_ids,
    );
    return { ids };
  }

  @Get('user')
  async getUserFlashcards(@User() user: AuthUser) {
    const res = await this.flashcardsService.getUserFlashcards(user.id);
    if (!res.success) {
      throw new BadRequestException(res.error || 'Failed');
    }
    return res;
  }

  @Post('generate-ai')
  @ApiOperation({
    summary: 'Generate flashcards using AI',
    description:
      'Creates flashcards using OpenRouter AI based on topic and difficulty',
  })
  @ApiResponse({
    status: 201,
    description: 'Flashcards generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate flashcards',
  })
  async generateAiFlashcards(@Body() dto: GenerateAiFlashcardsDto, @User() user: AuthUser) {
    const result = await this.flashcardsService.generateAiFlashcards(dto, user.id);
    if (!result.success) {
      throw new BadRequestException(
        result.error || 'Failed to generate AI flashcards',
      );
    }
    return result;
  }

  @Post('study-session')
  @ApiOperation({
    summary: 'Create a study session',
    description:
      'Creates a study session with flashcards filtered by topic and mastery status',
  })
  @ApiResponse({
    status: 201,
    description: 'Study session created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'No flashcards found for the specified criteria',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createStudySession(@Body() dto: StudySessionDto, @User() user: AuthUser) {
    const result = await this.flashcardsService.createStudySession(dto, user.id);
    if (!result.success) {
      if (result.error?.includes('No') && result.error?.includes('found')) {
        throw new BadRequestException(result.error);
      }
      throw new BadRequestException(
        result.error || 'Failed to create study session',
      );
    }
    return result;
  }

  @Post('update-progress')
  @ApiOperation({
    summary: 'Update flashcard learning progress',
    description:
      'Updates mastery status using Magoosh-style spaced repetition algorithm',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Flashcard not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateProgress(@Body() dto: UpdateProgressDto) {
    const result = await this.flashcardsService.updateProgress(dto);
    if (!result.success) {
      if (result.error?.includes('not found')) {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(
        result.error || 'Failed to update progress',
      );
    }
    return result;
  }

  @Post('generate-from-question')
  @ApiOperation({
    summary: 'Generate flashcard from existing question',
    description:
      'Creates a flashcard from a quiz question with smart answer generation',
  })
  @ApiResponse({
    status: 201,
    description: 'Flashcard generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Flashcard already exists for this question',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or could not generate answer',
  })
  async generateFromQuestion(@Body() dto: CreateFlashcardFromQuestionDto, @User() user: AuthUser) {
    const result = await this.flashcardsService.generateFromQuestion(dto, user.id);
    if (!result.success) {
      if (result.error?.includes('not found')) {
        throw new NotFoundException(result.error);
      }
      if (result.error?.includes('already exists')) {
        throw new ConflictException(result.error);
      }
      throw new BadRequestException(
        result.error || 'Failed to generate flashcard',
      );
    }
    return result;
  }

  @Get('due')
  @ApiOperation({ summary: 'Get flashcards due for review for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of due flashcards' })
  async getDueFlashcards(@User() user: AuthUser) {
    const res = await this.flashcardsService.getDueFlashcards(user.id);
    if (!res.success) {
      throw new BadRequestException(res.error || 'Failed to fetch');
    }
    return res;
  }

  @Patch(':flashcardId')
  @ApiOperation({ summary: 'Update a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard updated' })
  async updateFlashcard(
    @Param('flashcardId') flashcardId: string,
    @Body() dto: UpdateFlashcardDto,
  ) {
    const res = await this.flashcardsService.updateFlashcard(flashcardId, dto);
    if (!res.success) {
      throw new BadRequestException(res.error || 'Failed to update');
    }
    return res;
  }

  @Delete(':flashcardId')
  @ApiOperation({ summary: 'Delete a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard deleted' })
  async deleteFlashcard(@Param('flashcardId') flashcardId: string, @User() user: AuthUser) {
    const res = await this.flashcardsService.deleteFlashcard(flashcardId, user.id);
    if (!res.success) {
      throw new BadRequestException(res.error || 'Failed to delete');
    }
    return res;
  }
}
