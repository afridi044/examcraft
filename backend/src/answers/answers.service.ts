import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { ApiResponse } from '../types/shared.types';
import type { Tables } from '../types/supabase.generated';

// Re-usable Supabase row type for user_answers table
type UserAnswerRow = Tables<'user_answers'>;

@Injectable()
export class AnswersService {
  private readonly logger = new Logger(AnswersService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get all answers submitted by a user with optional filters.
   *
   * @param userId   The ID of the user whose answers we want to retrieve.
   * @param filters  Optional filters (quiz, session, topic).
   */
  getUserAnswers(
    userId: string,
    filters?: { quizId?: string; sessionId?: string; topicId?: string },
  ): Promise<ApiResponse<UserAnswerRow[]>> {
    this.logger.log(`Fetching answers for user ${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.databaseService.getUserAnswers(userId, filters);
  }
}
