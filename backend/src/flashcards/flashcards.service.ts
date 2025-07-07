import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { CreateFlashcardFromQuestionDto } from './dto/create-from-question.dto';
import { GenerateAiFlashcardsDto } from './dto/generate-ai-flashcards.dto';
import { StudySessionDto } from './dto/study-session.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { AiFlashcardService } from './services/ai-flashcard.service';
import { ProgressTrackingService } from './services/progress-tracking.service';
import {
  ApiResponse,
  CreateFlashcardInput,
  CreateTopicInput,
  UpdateFlashcardInput,
} from '../types/shared.types';
import type { Tables } from '../types/supabase.generated';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';

type FlashcardRow = Tables<'flashcards'> & {
  topic?: {
    topic_id: string;
    name: string;
    description: string | null;
    parent_topic_id: string | null;
  };
};

@Injectable()
export class FlashcardsService {
  private readonly logger = new Logger(FlashcardsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly aiFlashcardService: AiFlashcardService,
    private readonly progressTrackingService: ProgressTrackingService,
  ) { }

  async createFlashcard(dto: CreateFlashcardDto, userId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`📝 Creating flashcard with topic_id: ${dto.topic_id}, custom_topic: ${dto.custom_topic}`);

      let topicId = dto.topic_id;
      if (!topicId && dto.custom_topic) {
        this.logger.log(`🔧 Creating custom topic: ${dto.custom_topic}`);
        const topicInput: CreateTopicInput = {
          name: dto.custom_topic,
          description: `Custom topic: ${dto.custom_topic}`,
        };
        const topicRes = await this.databaseService.createTopic(topicInput);
        if (!topicRes.success || !topicRes.data) {
          this.logger.error(`❌ Failed to create custom topic: ${topicRes.error}`);
          return topicRes as any;
        }
        topicId = topicRes.data.topic_id;
        this.logger.log(`✅ Created custom topic with ID: ${topicId}`);
      }

      this.logger.log(`📋 Final topic_id for flashcard: ${topicId}`);

      const flashInput: CreateFlashcardInput = {
        user_id: userId,
        question: dto.question,
        answer: dto.answer,
        topic_id: topicId,
        source_question_id: dto.source_question_id,
        tags: dto.tags,
      };

      this.logger.log(`💾 Creating flashcard with input:`, JSON.stringify(flashInput, null, 2));

      return await this.databaseService.createFlashcard(flashInput);
    } catch (error) {
      this.logger.error('createFlashcard failed', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed',
      };
    }
  }



  async hasFlashcard(userId: string, questionId: string): Promise<boolean> {
    const result =
      await this.databaseService.getFlashcardByUserAndSourceQuestion(
        userId,
        questionId,
      );
    return result.success && !!result.data;
  }

  async hasFlashcardsBatch(
    userId: string,
    questionIds: string[],
  ): Promise<string[]> {
    const res = await this.databaseService.getFlashcardsByUserAndQuestionIds(
      userId,
      questionIds,
    );
    if (!res.success || !res.data) return [];
    return res.data;
  }

  async getUserFlashcards(userId: string) {
    return this.databaseService.getUserFlashcards(userId);
  }

  async generateAiFlashcards(dto: GenerateAiFlashcardsDto, userId: string): Promise<
    ApiResponse<{
      flashcards: any[];
      topic_id?: string;
      topic_name: string;
      generated_count: number;
      requested_count: number;
      errors?: string[];
      message: string;
    }>
  > {
    try {
      this.logger.log(
        `🤖 Starting AI flashcard generation for user: ${userId}, topic: ${dto.topic_name}`,
      );

      // Create or get topic
      let topicId = dto.topic_id;
      this.logger.log(`🤖 AI Generation - Initial topic_id: ${topicId}, custom_topic: ${dto.custom_topic}`);

      if (!topicId && dto.custom_topic) {
        this.logger.log(`🔧 Creating custom topic for AI generation: ${dto.custom_topic}`);
        const topicInput: CreateTopicInput = {
          name: dto.custom_topic,
          description: `Custom topic: ${dto.custom_topic}`,
        };
        const topicRes = await this.databaseService.createTopic(topicInput);
        if (topicRes.success && topicRes.data) {
          topicId = topicRes.data.topic_id;
          this.logger.log(`✅ Created custom topic with ID: ${topicId}`);
        } else {
          this.logger.error('Failed to create custom topic:', topicRes.error);
        }
      }

      this.logger.log(`📋 AI Generation - Final topic_id for flashcards: ${topicId}`);

      // Generate flashcards using AI service
      const aiFlashcards =
        await this.aiFlashcardService.generateFlashcardsWithAI(dto);

      // Create flashcards in database
      const createdFlashcards: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < aiFlashcards.length; i++) {
        const aiFlashcard = aiFlashcards[i];

        try {
          const flashcardInput: CreateFlashcardInput = {
            user_id: userId,
            question: aiFlashcard.question,
            answer: aiFlashcard.answer,
            topic_id: topicId,
            tags: [
              'ai-generated',
              dto.topic_name.toLowerCase().replace(/\s+/g, '-'),
              `difficulty-${aiFlashcard.difficulty}`,
            ].filter(Boolean),
          };

          const flashcardRes =
            await this.databaseService.createFlashcard(flashcardInput);

          if (flashcardRes.success && flashcardRes.data) {
            createdFlashcards.push(flashcardRes.data);
          } else {
            const errorMsg = `Failed to create flashcard ${i + 1}: ${flashcardRes.error}`;
            errors.push(errorMsg);
            this.logger.error(errorMsg);
          }
        } catch (error) {
          const errorMsg = `Failed to create flashcard ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg, error);
        }
      }

      const successMessage = `Successfully generated ${createdFlashcards.length} out of ${dto.num_flashcards} flashcards`;
      this.logger.log(`✅ ${successMessage}`);

      return {
        success: true,
        data: {
          flashcards: createdFlashcards,
          topic_id: topicId,
          topic_name: dto.topic_name,
          generated_count: createdFlashcards.length,
          requested_count: dto.num_flashcards,
          errors: errors.length > 0 ? errors : undefined,
          message: successMessage,
        },
        error: null,
      };
    } catch (error) {
      this.logger.error('AI flashcard generation failed:', error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate AI flashcards',
      };
    }
  }

  async createStudySession(dto: StudySessionDto, userId: string): Promise<
    ApiResponse<{
      session: {
        session_id: string;
        topic_id: string;
        topic_name: string;
        total_cards: number;
        mastery_status: string;
        cards: FlashcardRow[];
      };
      fallback: boolean;
      message?: string;
    }>
  > {
    try {
      this.logger.log(
        `📚 Creating study session for user: ${userId}, topic: ${dto.topic_id}, mastery: ${dto.mastery_status || 'learning'}`,
      );

      const masteryFilter = dto.mastery_status || 'learning';

      // NEW: Mixed selection quotas (percentage of total)
      const MIXED_QUOTAS = {
        under_review: 0.5,
        learning: 0.4,
        mastered: 0.1,
      } as const;

      let flashcards: FlashcardRow[] = [];
      let usedFallback = false;

      // Try specific mastery status first (if not "all")
      if (masteryFilter === 'mixed') {
        // --- Mixed session: build a deck with quotas ---

        const allCardsByStatus: Record<'learning' | 'under_review' | 'mastered', FlashcardRow[]> = {
          learning: [],
          under_review: [],
          mastered: [],
        };

        // Fetch each subset (could be optimized with parallel promises)
        for (const status of ['learning', 'under_review', 'mastered'] as const) {
          const res = await this.databaseService.getFlashcardsByTopicAndMastery(
            userId,
            dto.topic_id,
            status,
          );
          if (res.success && res.data) {
            allCardsByStatus[status] = res.data;
          }
        }

        // Determine deck size (default to min total available or 20)
        const totalAvailable = Object.values(allCardsByStatus).reduce((sum, arr) => sum + arr.length, 0);
        const deckSize = Math.min(totalAvailable, 20);

        const pickCards = (cards: FlashcardRow[], count: number) => {
          // Shuffle then slice to count
          return cards.sort(() => Math.random() - 0.5).slice(0, count);
        };

        // Build deck according to quotas
        for (const status of ['under_review', 'learning', 'mastered'] as const) {
          const quotaCount = Math.round(deckSize * MIXED_QUOTAS[status]);
          const picked = pickCards(allCardsByStatus[status], quotaCount);
          flashcards.push(...picked);
        }

        // If deck smaller than desired (not enough cards in some buckets), fill with remaining learning cards then under_review etc.
        if (flashcards.length < deckSize) {
          const remaining = deckSize - flashcards.length;
          const fallbackPool = [
            ...allCardsByStatus.learning.filter(c => !flashcards.includes(c)),
            ...allCardsByStatus.under_review.filter(c => !flashcards.includes(c)),
            ...allCardsByStatus.mastered.filter(c => !flashcards.includes(c)),
          ];
          flashcards.push(...pickCards(fallbackPool, remaining));
        }

        // As final fallback if still empty
        if (flashcards.length === 0) {
          usedFallback = true;
        }

      } else if (masteryFilter !== 'all') {
        const masteryCardsRes =
          await this.databaseService.getFlashcardsByTopicAndMastery(
            userId,
            dto.topic_id,
            masteryFilter as 'learning' | 'under_review' | 'mastered',
          );

        if (
          masteryCardsRes.success &&
          masteryCardsRes.data &&
          masteryCardsRes.data.length > 0
        ) {
          flashcards = masteryCardsRes.data;
        } else {
          // Fallback to all cards for this topic
          const allCardsRes = await this.databaseService.getFlashcardsByTopic(
            userId,
            dto.topic_id,
          );
          if (
            allCardsRes.success &&
            allCardsRes.data &&
            allCardsRes.data.length > 0
          ) {
            flashcards = allCardsRes.data;
            usedFallback = true;
          }
        }
      } else {
        // Get all cards for the topic
        const allCardsRes = await this.databaseService.getFlashcardsByTopic(
          userId,
          dto.topic_id,
        );
        if (allCardsRes.success && allCardsRes.data) {
          flashcards = allCardsRes.data;
        }
      }

      if (flashcards.length === 0) {
        const statusText = masteryFilter === 'all' ? 'any' : masteryFilter;
        return {
          success: false,
          data: null,
          error: `No ${statusText} flashcards found for this topic`,
        };
      }

      // Shuffle the cards
      const shuffledCards = flashcards.sort(() => Math.random() - 0.5);

      // Get topic name from the first card's topic relation
      this.logger.log(`🔍 First card topic data:`, JSON.stringify(shuffledCards[0]?.topic, null, 2));
      const topicName = shuffledCards[0]?.topic?.name || 'General';
      this.logger.log(`📝 Extracted topic name: ${topicName}`);

      const sessionId = `session_${Date.now()}_${userId}`;

      this.logger.log(
        `✅ Study session created with ${shuffledCards.length} cards`,
      );

      return {
        success: true,
        data: {
          session: {
            session_id: sessionId,
            topic_id: dto.topic_id,
            topic_name: topicName,
            total_cards: shuffledCards.length,
            mastery_status: usedFallback ? 'mixed_fallback' : masteryFilter,
            cards: shuffledCards as FlashcardRow[],
          },
          fallback: usedFallback,
          message: usedFallback
            ? `No ${masteryFilter} cards found. Showing all cards for this topic.`
            : undefined,
        },
        error: null,
      };
    } catch (error) {
      this.logger.error('Study session creation failed:', error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start study session',
      };
    }
  }

  async updateProgress(dto: UpdateProgressDto): Promise<
    ApiResponse<{
      flashcard_id: string;
      performance: string;
      mastery_status: string;
      consecutive_correct: number;
      message: string;
      invalidate_cache: boolean;
    }>
  > {
    try {
      this.logger.log(
        `📈 Updating progress for flashcard: ${dto.flashcard_id}, performance: ${dto.performance}`,
      );

      // Get current flashcard data
      const flashcardResult = await this.databaseService.getFlashcardById(
        dto.flashcard_id,
      );

      if (!flashcardResult.success || !flashcardResult.data) {
        return {
          success: false,
          data: null,
          error: 'Flashcard not found',
        };
      }

      const flashcard = flashcardResult.data;

      // Calculate new mastery status using Magoosh-style algorithm
      const newValues = this.progressTrackingService.calculateMasteryStatus(
        dto.performance,
        flashcard.mastery_status as 'learning' | 'under_review' | 'mastered',
        flashcard.consecutive_correct,
      );

      // Update flashcard in database
      const updateData: UpdateFlashcardInput = {
        mastery_status: newValues.mastery_status,
        consecutive_correct: newValues.consecutive_correct,
      };

      const updateResult = await this.databaseService.updateFlashcard(
        dto.flashcard_id,
        updateData,
      );

      if (!updateResult.success) {
        return {
          success: false,
          data: null,
          error: 'Failed to update flashcard',
        };
      }

      const message = this.progressTrackingService.getMasteryMessage(
        dto.performance,
        newValues.mastery_status,
      );

      this.logger.log(
        `✅ Progress updated: ${flashcard.mastery_status} → ${newValues.mastery_status}, streak: ${newValues.consecutive_correct}`,
      );

      return {
        success: true,
        data: {
          flashcard_id: dto.flashcard_id,
          performance: dto.performance,
          mastery_status: newValues.mastery_status,
          consecutive_correct: newValues.consecutive_correct,
          message: message,
          invalidate_cache: true,
        },
        error: null,
      };
    } catch (error) {
      this.logger.error('Progress update failed:', error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to update progress',
      };
    }
  }

  async generateFromQuestion(
    dto: CreateFlashcardFromQuestionDto,
    userId: string,
  ): Promise<ApiResponse<FlashcardRow>> {
    try {
      this.logger.log(
        `🔧 Generating flashcard from question: ${dto.question_id}, topic_id: ${dto.topic_id || 'using question topic'}`,
      );

      // Get the original question details
      const questionResult = await this.databaseService.getQuestionById(
        dto.question_id,
      );
      if (!questionResult.success || !questionResult.data) {
        return {
          success: false,
          data: null,
          error: 'Question not found',
        };
      }

      const question = questionResult.data;

      // Check if flashcard already exists for this question - OPTIMIZED
      const existingFlashcardResult = await this.databaseService.getFlashcardByUserAndSourceQuestion(
        userId,
        dto.question_id
      );

      if (existingFlashcardResult.success && existingFlashcardResult.data) {
        return {
          success: false,
          data: null,
          error: 'Flashcard already exists for this question',
        };
      }

      // Generate flashcard content
      const flashcardQuestion = dto.custom_question || question.content;
      let flashcardAnswer = dto.custom_answer;

      // If no custom answer provided, generate one from the question options
      if (!flashcardAnswer && question.question_options) {
        const correctOption = question.question_options.find(
          (opt: any) => opt.is_correct,
        );
        if (correctOption) {
          if (question.question_type === 'multiple-choice') {
            flashcardAnswer = correctOption.content;
          } else if (question.question_type === 'true-false') {
            flashcardAnswer =
              correctOption.content === 'true' ? 'True' : 'False';
          }
        }
      }

      // For fill-in-blank questions, we might need to be more creative
      if (!flashcardAnswer && question.question_type === 'fill-in-blank') {
        flashcardAnswer =
          'Please provide the correct answer for this question.';
      }

      if (!flashcardAnswer) {
        return {
          success: false,
          data: null,
          error:
            'Could not generate answer for flashcard. Please provide a custom answer.',
        };
      }

      // Create the flashcard
      const flashcardInput: CreateFlashcardInput = {
        user_id: userId,
        question: flashcardQuestion,
        answer: flashcardAnswer,
        topic_id: dto.topic_id || question.topic_id, // Use provided topic_id or fall back to question's topic
        source_question_id: dto.question_id,
        tags: [
          question.question_type,
          question.topic?.name?.toLowerCase().replace(/\s+/g, '-') || 'general',
          `difficulty-${question.difficulty || 1}`,
        ].filter(Boolean),
      };

      this.logger.log(
        `📝 Creating flashcard with topic_id: ${flashcardInput.topic_id} (provided: ${dto.topic_id}, question topic: ${question.topic_id})`,
      );

      const flashcardResult =
        await this.databaseService.createFlashcard(flashcardInput);

      if (!flashcardResult.success || !flashcardResult.data) {
        return {
          success: false,
          data: null,
          error: 'Failed to create flashcard',
        };
      }

      this.logger.log(
        `✅ Flashcard generated from question: ${dto.question_id} → ${flashcardResult.data.flashcard_id} with topic_id: ${flashcardResult.data.topic_id}`,
      );

      return {
        success: true,
        data: flashcardResult.data as FlashcardRow,
        error: null,
      };
    } catch (error) {
      this.logger.error('Generate from question failed:', error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate flashcard',
      };
    }
  }

  async getDueFlashcards(userId: string): Promise<ApiResponse<FlashcardRow[]>> {
    return this.databaseService.getFlashcardsDueForReview(userId);
  }

  async updateFlashcard(
    flashcardId: string,
    dto: UpdateFlashcardDto,
  ): Promise<ApiResponse<FlashcardRow>> {
    try {
      // Handle optional custom_topic creation
      let topicId = dto.topic_id;
      if (!topicId && dto.custom_topic) {
        const topicRes = await this.databaseService.createTopic({
          name: dto.custom_topic,
          description: `Custom topic: ${dto.custom_topic}`,
        });
        if (topicRes.success && topicRes.data) {
          topicId = topicRes.data.topic_id;
        }
      }

      const updateData: UpdateFlashcardInput = {
        question: dto.question,
        answer: dto.answer,
        topic_id: topicId,
        mastery_status: dto.mastery_status,
        tags: dto.tags,
      };

      return this.databaseService.updateFlashcard(flashcardId, updateData);
    } catch (error) {
      this.logger.error('updateFlashcard failed', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed',
      };
    }
  }

  async deleteFlashcard(flashcardId: string, userId: string): Promise<ApiResponse<boolean>> {
    return this.databaseService.deleteFlashcard(flashcardId, userId);
  }
}
