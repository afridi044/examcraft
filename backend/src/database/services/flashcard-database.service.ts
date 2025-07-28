import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  FlashcardRow,
  QuestionRow,
  TablesInsert,
  TablesUpdate,
} from '../../types/shared.types';

@Injectable()
export class FlashcardDatabaseService extends BaseDatabaseService {

  async createFlashcard(
    input: TablesInsert<'flashcards'>,
  ): Promise<ApiResponse<FlashcardRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.FLASHCARDS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createFlashcard');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createFlashcard');
    }
  }

  async getFlashcardByUserAndSourceQuestion(
    userId: string,
    questionId: string,
  ): Promise<ApiResponse<FlashcardRow | null>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select('*')
        .eq('user_id', userId)
        .eq('source_question_id', questionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.handleSuccess(null); // not found
        }
        return this.handleError(error, 'getFlashcardByUserAndSourceQuestion');
      }

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getFlashcardByUserAndSourceQuestion');
    }
  }

  async getFlashcardsByUserAndQuestionIds(
    userId: string,
    questionIds: string[],
  ): Promise<ApiResponse<string[]>> {
    try {
      if (!questionIds.length) return this.handleSuccess([]);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select('source_question_id')
        .eq('user_id', userId)
        .in('source_question_id', questionIds);

      if (error) {
        return this.handleError(error, 'getFlashcardsByUserAndQuestionIds');
      }

      const ids = (data || [])
        .map(
          (row: { source_question_id: string | null }) =>
            row.source_question_id,
        )
        .filter((id): id is string => id !== null);

      return this.handleSuccess(ids);
    } catch (error) {
      return this.handleError(error, 'getFlashcardsByUserAndQuestionIds');
    }
  }

  async getUserFlashcards(
    userId: string,
  ): Promise<ApiResponse<FlashcardRow[]>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return this.handleError(error, 'getUserFlashcards');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getUserFlashcards');
    }
  }

  async getFlashcardById(
    flashcardId: string,
  ): Promise<ApiResponse<FlashcardRow>> {
    try {
      this.logger.log(`📇 Getting flashcard by ID: ${flashcardId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*)
        `,
        )
        .eq('flashcard_id', flashcardId)
        .single();

      if (error) return this.handleError(error, 'getFlashcardById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getFlashcardById');
    }
  }

  async updateFlashcard(
    flashcardId: string,
    updateData: TablesUpdate<'flashcards'>,
  ): Promise<ApiResponse<FlashcardRow>> {
    try {
      this.logger.log(`📝 Updating flashcard: ${flashcardId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('flashcard_id', flashcardId)
        .select()
        .single();

      if (error) return this.handleError(error, 'updateFlashcard');
      this.logger.log(`✅ Flashcard updated successfully: ${flashcardId}`);
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateFlashcard');
    }
  }



  async getFlashcardsByTopic(
    userId: string,
    topicId: string,
  ): Promise<ApiResponse<FlashcardRow[]>> {
    try {
      this.logger.log(
        `📂 Getting flashcards by topic: ${topicId} for user: ${userId}`,
      );

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*)
        `,
        )
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (error) return this.handleError(error, 'getFlashcardsByTopic');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getFlashcardsByTopic');
    }
  }

  async getFlashcardsByTopicAndMastery(
    userId: string,
    topicId: string,
    masteryStatus: 'learning' | 'under_review' | 'mastered',
  ): Promise<ApiResponse<FlashcardRow[]>> {
    try {
      this.logger.log(
        `🎯 Getting flashcards by topic: ${topicId} and mastery: ${masteryStatus} for user: ${userId}`,
      );

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*)
        `,
        )
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .eq('mastery_status', masteryStatus)
        .order('created_at', { ascending: false });

      if (error)
        return this.handleError(error, 'getFlashcardsByTopicAndMastery');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getFlashcardsByTopicAndMastery');
    }
  }

  async deleteFlashcard(flashcardId: string, userId: string): Promise<ApiResponse<boolean>> {
    try {
      this.logger.log(`🗑️ Deleting flashcard: ${flashcardId} for user: ${userId}`);

      // First check if the flashcard exists and get its details
      const { data: flashcard, error: fetchError } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select('flashcard_id, user_id')
        .eq('flashcard_id', flashcardId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return this.handleError(new Error('Flashcard not found'), 'deleteFlashcard');
        }
        return this.handleError(fetchError, 'deleteFlashcard');
      }

      // Check if the user owns this flashcard
      if (flashcard.user_id !== userId) {
        return this.handleError(new Error('Unauthorized: You can only delete your own flashcards'), 'deleteFlashcard');
      }

      // Delete the flashcard
      const { error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .delete()
        .eq('flashcard_id', flashcardId);

      if (error) return this.handleError(error, 'deleteFlashcard');

      this.logger.log(`✅ Successfully deleted flashcard: ${flashcardId}`);
      return this.handleSuccess(true);
    } catch (error) {
      return this.handleError(error, 'deleteFlashcard');
    }
  }

  async getFlashcardsDueForReview(
    userId: string,
  ): Promise<ApiResponse<FlashcardRow[]>> {
    try {
      this.logger.log(`📅 Getting flashcards due for review for user: ${userId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*)
        `,
        )
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString())
        .order('next_review', { ascending: true });

      if (error) return this.handleError(error, 'getFlashcardsDueForReview');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getFlashcardsDueForReview');
    }
  }
}
