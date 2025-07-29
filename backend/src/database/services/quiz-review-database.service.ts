import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  QuestionRow,
  QuestionOptionRow,
  ExplanationRow,
  UserAnswerRow,
} from '../../types/shared.types';

@Injectable()
export class QuizReviewDatabaseService extends BaseDatabaseService {
  
  async getQuizReview(
    quizId: string,
    userId: string,
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.log(
        `🧐 Building quiz review for quiz ${quizId} and user ${userId}`,
      );

      // Type definitions for complex query results
      interface QuizDataResult {
        quiz_id: string;
        title: string;
        description: string | null;
        topic: { topic_id: string; name: string } | { topic_id: string; name: string }[] | null;
        quiz_questions: {
          question_id: string;
          question_order: number;
          questions: QuestionRow & {
            question_options: QuestionOptionRow[];
          };
        }[];
      }

      // ------------------------------------------------
      // 1. Get quiz with topic and ordered questions
      // ------------------------------------------------
      const { data: quizData, error: quizError } = await this.supabase
        .from(TABLE_NAMES.QUIZZES)
        .select(
          `
          quiz_id,
          title,
          description,
          topic:topics(topic_id, name),
          quiz_questions(question_id, question_order, questions(*, question_options(*)))
        `,
        )
        .eq('quiz_id', quizId)
        .single<QuizDataResult>();

      if (quizError) return this.handleError(quizError, 'getQuizReview');

      // ------------------------------------------------
      // 2. Get user answers for this quiz
      // ------------------------------------------------
      const { data: answersData, error: answersError } = (await this.supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .select('*')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false })) as { data: UserAnswerRow[] | null; error: any };

      if (answersError) return this.handleError(answersError, 'getQuizReview');

      const answerMap = new Map<string, UserAnswerRow>();
      (answersData || []).forEach((ans) => {
        if (!answerMap.has(ans.question_id)) {
          answerMap.set(ans.question_id, ans);
        }
      });

      // ------------------------------------------------
      // 3. Get question IDs for batch operations
      // ------------------------------------------------
      const questionIds = (quizData?.quiz_questions || []).map(
        (q) => q.question_id,
      );

      // ------------------------------------------------
      // 4. Get flashcard status for questions
      // ------------------------------------------------
      const flashcardMap = new Map<string, boolean>();
      if (questionIds.length) {
        const flashcardResponse = await this.getFlashcardsByUserAndQuestionIds(userId, questionIds);
        if (flashcardResponse.success && flashcardResponse.data) {
          flashcardResponse.data.forEach((questionId) => {
            flashcardMap.set(questionId, true);
          });
        }
      }

      // ------------------------------------------------
      // 5. Get explanations for questions
      // ------------------------------------------------
      const explanationMap = new Map<string, ExplanationRow>();
      if (questionIds.length) {
        const { data: explanations, error: explError } = (await this.supabase
          .from(TABLE_NAMES.EXPLANATIONS)
          .select('*')
          .in('question_id', questionIds)) as {
          data: ExplanationRow[] | null;
          error: any;
        };

        if (explError) {
          // Not fatal – continue without explanations
          this.logger.warn(
            `Explanation fetch failed: ${(explError as Error)?.message || 'Unknown error'}`,
          );
        } else {
          (explanations || []).forEach((exp) => {
            explanationMap.set(exp.question_id, exp);
          });
        }
      }

      // ------------------------------------------------
      // 6. Assemble questions array
      // ------------------------------------------------
      const questions = (quizData?.quiz_questions || [])
        .sort((a, b) => a.question_order - b.question_order)
        .map((qq) => {
          const q = qq.questions;
          const userAnswer = answerMap.get(q.question_id) || null;
          const explanation = explanationMap.get(q.question_id) || null;
          const flashcardExists = flashcardMap.get(q.question_id) || false;

          return {
            question_id: q.question_id,
            content: q.content,
            question_type: q.question_type,
            difficulty: q.difficulty,
            question_options: q.question_options || [],
            flashcard_exists: flashcardExists,
            explanation: explanation
              ? {
                  content: explanation.content,
                  ai_generated: explanation.ai_generated,
                }
              : undefined,
            user_answer: userAnswer
              ? {
                  selected_option_id: userAnswer.selected_option_id,
                  text_answer: userAnswer.text_answer,
                  is_correct: userAnswer.is_correct,
                  time_taken_seconds: userAnswer.time_taken_seconds,
                }
              : null,
          };
        });

      // ------------------------------------------------
      // 7. Compute stats
      // ------------------------------------------------
      const totalQuestions = questions.length;
      const correctAnswers = questions.filter(
        (q) => q.user_answer?.is_correct === true,
      ).length;
      const percentage =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0;
      // Get total quiz time from quiz completion record
      const { data: quizCompletion, error: completionError } = await this.supabase
        .from('quiz_completions')
        .select('time_spent_seconds')
        .eq('user_id', userId)
        .eq('quiz_id', quizId)
        .single();

      if (completionError) {
        this.logger.warn(`No quiz completion record found for quiz ${quizId}`);
      }

      // Use quiz completion time if available, otherwise fall back to summing question times
      const totalTime = quizCompletion?.time_spent_seconds || Array.from(answerMap.values()).reduce(
        (sum: number, ans) => sum + (ans.time_taken_seconds || 0),
        0,
      );

      // ------------------------------------------------
      // 8. Build response
      // ------------------------------------------------
      const reviewPayload = {
        quiz: {
          quiz_id: quizData?.quiz_id || '',
          title: quizData?.title || '',
          description: quizData?.description || null,
          topic: (() => {
            // Supabase may return topic as an object or an array; normalise to single object
            if (!quizData?.topic) return undefined;
            const maybeArray = quizData.topic;
            if (Array.isArray(maybeArray)) {
              return maybeArray.length
                ? { topic_id: maybeArray[0]?.topic_id || '', name: maybeArray[0]?.name || '' }
                : undefined;
            }
            return { topic_id: maybeArray.topic_id || '', name: maybeArray.name };
          })(),
        },
        questions,
        quiz_stats: {
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          percentage,
          total_time: totalTime,
        },
      };

      return this.handleSuccess(reviewPayload);
    } catch (error) {
      return this.handleError(error, 'getQuizReview');
    }
  }

  // Helper method needed for quiz review
  private async getFlashcardsByUserAndQuestionIds(
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
}
