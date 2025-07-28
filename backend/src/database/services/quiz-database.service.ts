import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  QuizRow,
  QuizWithQuestions,
  QuestionRow,
  QuestionOptionRow,
  ExplanationRow,
  UserAnswerRow,
  QuizQuestionRow,
  TablesInsert,
} from '../../types/shared.types';

@Injectable()
export class QuizDatabaseService extends BaseDatabaseService {
  
  async getUserQuizzes(userId: string): Promise<ApiResponse<QuizRow[]>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.QUIZZES)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return this.handleError(error, 'getUserQuizzes');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getUserQuizzes');
    }
  }

  async getUserQuizAttempts(userId: string): Promise<ApiResponse<any[]>> {
    try {
      this.logger.log(`📊 Getting quiz attempts for user: ${userId}`);

      // OPTIMIZED: Single database function call replaces 3 queries + complex processing
      const { data: quizHistory, error } = await this.supabase.rpc(
        'get_user_quiz_attempts',
        { p_user_id: userId },
      );

      if (error) {
        this.logger.error('❌ Error fetching quiz attempts:', error);
        return this.handleError(error, 'getUserQuizAttempts');
      }

      this.logger.log(`✅ Retrieved ${quizHistory?.length || 0} quiz attempts`);
      return this.handleSuccess(quizHistory || []);
    } catch (error) {
      return this.handleError(error, 'getUserQuizAttempts');
    }
  }

  async searchQuizzes(query: string, userId: string): Promise<ApiResponse<any[]>> {
    try {
      this.logger.log(`🔍 Searching quizzes for user: ${userId}, query: ${query}`);

      const searchTerm = `%${query}%`;

      // Search quizzes by title only
      const { data: quizzes, error } = await this.supabase
        .from(TABLE_NAMES.QUIZZES)
        .select(`
          quiz_id,
          title,
          description,
          created_at,
          topics(name)
        `)
        .eq('user_id', userId)
        .ilike('title', searchTerm)
        .order('created_at', { ascending: false });

      // Get quiz attempt information for each quiz
      if (quizzes && quizzes.length > 0) {
        const quizIds = quizzes.map(q => q.quiz_id);
        
        // Get user answers for these quizzes to determine completion status
        const { data: userAnswers, error: answersError } = await this.supabase
          .from(TABLE_NAMES.USER_ANSWERS)
          .select('quiz_id, created_at')
          .eq('user_id', userId)
          .in('quiz_id', quizIds)
          .not('quiz_id', 'is', null);

        if (!answersError && userAnswers) {
          // Group answers by quiz_id and find the latest attempt
          const quizAttempts = userAnswers.reduce((acc, answer) => {
            const quizId = answer.quiz_id;
            if (quizId && (!acc[quizId] || new Date(answer.created_at) > new Date(acc[quizId].created_at))) {
              acc[quizId] = answer;
            }
            return acc;
          }, {} as Record<string, any>);

          // Add completion status to each quiz
          quizzes.forEach(quiz => {
            const attempt = quizAttempts[quiz.quiz_id];
            (quiz as any).has_attempt = !!attempt;
            (quiz as any).last_attempt_date = attempt?.created_at || null;
          });
        }
      }

      if (error) {
        this.logger.error('❌ Error searching quizzes:', error);
        return this.handleError(error, 'searchQuizzes');
      }

      this.logger.log(`✅ Found ${quizzes?.length || 0} matching quizzes`);
      return this.handleSuccess(quizzes || []);
    } catch (error) {
      return this.handleError(error, 'searchQuizzes');
    }
  }

  async getQuizWithQuestions(
    quizId: string,
  ): Promise<ApiResponse<QuizWithQuestions>> {
    try {
      // Get quiz details with topic information
      const { data: quiz, error: quizError } = await this.supabase
        .from(TABLE_NAMES.QUIZZES)
        .select(
          `
          *,
          topics(*)
        `,
        )
        .eq('quiz_id', quizId)
        .single();

      if (quizError) return this.handleError(quizError, 'getQuizWithQuestions');

      // Get questions for this quiz with their options
      const { data: questions, error: questionsError } = await this.supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select(
          `
          *,
          question_options(*),
          explanations(*),
          quiz_questions!inner(quiz_id)
        `,
        )
        .eq('quiz_questions.quiz_id', quizId)
        .order('question_id');

      if (questionsError)
        return this.handleError(questionsError, 'getQuizWithQuestions');

      const quizWithQuestions = {
        ...quiz,
        questions: questions || [],
      } as QuizWithQuestions;

      return this.handleSuccess(quizWithQuestions);
    } catch (error) {
      return this.handleError(error, 'getQuizWithQuestions');
    }
  }

  async createQuiz(
    input: TablesInsert<'quizzes'>,
  ): Promise<ApiResponse<QuizRow>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.QUIZZES)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createQuiz');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createQuiz');
    }
  }

  async submitAnswer(
    input: TablesInsert<'user_answers'>,
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.log(
        `📝 Submitting answer for question: ${input.question_id}`,
      );

      // First, delete any previous answer for this user / quiz / question.
      // `quiz_id` is mandatory for quiz answers but can be null for other
      // contexts (e.g. flashcard study).  Guard it so the `.eq()` filter only
      // runs when we have a string, which also resolves the TypeScript error.
      const deleteQuery = this.supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .delete()
        .eq('user_id', input.user_id)
        .eq('question_id', input.question_id);

      if (input.quiz_id) {
        deleteQuery.eq('quiz_id', input.quiz_id);
      }

      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        this.logger.error('❌ Failed to delete previous answer', deleteError);
        return this.handleError(deleteError, 'submitAnswer - delete previous');
      }

      // Insert the new answer
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'submitAnswer');

      this.logger.log(`✅ Answer submitted successfully`);
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'submitAnswer');
    }
  }

  async deleteQuiz(quizId: string): Promise<ApiResponse<null>> {
    try {
      this.logger.log(
        `🗑️ Starting complete cascade deletion of quiz: ${quizId}`,
      );

      // STEP 1: Get all question IDs for this quiz
      const { data: quizQuestions, error: getQuestionsError } =
        await this.supabaseAdmin
          .from(TABLE_NAMES.QUIZ_QUESTIONS)
          .select('question_id')
          .eq('quiz_id', quizId);

      if (getQuestionsError) {
        this.logger.error(
          `Failed to get question IDs for quiz ${quizId}:`,
          getQuestionsError,
        );
        return this.handleError(
          getQuestionsError,
          'deleteQuiz - get question IDs',
        );
      }

      const questionIds = quizQuestions?.map((qq) => qq.question_id) || [];
      this.logger.log(
        `Found ${questionIds.length} questions to delete for quiz ${quizId}`,
      );

      // STEP 2: Delete user answers for this quiz
      const { error: answersError } = await this.supabaseAdmin
        .from(TABLE_NAMES.USER_ANSWERS)
        .delete()
        .eq('quiz_id', quizId);

      if (answersError) {
        this.logger.error(
          `Failed to delete user answers for quiz ${quizId}:`,
          answersError,
        );
        return this.handleError(answersError, 'deleteQuiz - user answers');
      }

      // STEP 3: Delete quiz-question relationships
      const { error: quizQuestionsError } = await this.supabaseAdmin
        .from(TABLE_NAMES.QUIZ_QUESTIONS)
        .delete()
        .eq('quiz_id', quizId);

      if (quizQuestionsError) {
        this.logger.error(
          `Failed to delete quiz questions for quiz ${quizId}:`,
          quizQuestionsError,
        );
        return this.handleError(
          quizQuestionsError,
          'deleteQuiz - quiz questions',
        );
      }

      // STEP 4: Delete explanations for the questions (if any)
      if (questionIds.length > 0) {
        const { error: explanationsError } = await this.supabaseAdmin
          .from(TABLE_NAMES.EXPLANATIONS)
          .delete()
          .in('question_id', questionIds);

        if (explanationsError) {
          this.logger.error(
            `Failed to delete explanations for quiz ${quizId}:`,
            explanationsError,
          );
          return this.handleError(
            explanationsError,
            'deleteQuiz - explanations',
          );
        }
      }

      // STEP 5: Delete question options for the questions
      if (questionIds.length > 0) {
        const { error: optionsError } = await this.supabaseAdmin
          .from(TABLE_NAMES.QUESTION_OPTIONS)
          .delete()
          .in('question_id', questionIds);

        if (optionsError) {
          this.logger.error(
            `Failed to delete question options for quiz ${quizId}:`,
            optionsError,
          );
          return this.handleError(
            optionsError,
            'deleteQuiz - question options',
          );
        }
      }

      // STEP 6: Delete the questions themselves
      if (questionIds.length > 0) {
        const { error: questionsError } = await this.supabaseAdmin
          .from(TABLE_NAMES.QUESTIONS)
          .delete()
          .in('question_id', questionIds);

        if (questionsError) {
          this.logger.error(
            `Failed to delete questions for quiz ${quizId}:`,
            questionsError,
          );
          return this.handleError(questionsError, 'deleteQuiz - questions');
        }
      }

      // STEP 7: Finally delete the quiz itself
      const { error: quizError } = await this.supabaseAdmin
        .from(TABLE_NAMES.QUIZZES)
        .delete()
        .eq('quiz_id', quizId);

      if (quizError) {
        this.logger.error(`Failed to delete quiz ${quizId}:`, quizError);
        return this.handleError(quizError, 'deleteQuiz - quiz');
      }

      this.logger.log(
        `✅ Successfully deleted quiz ${quizId} with ALL related data (${questionIds.length} questions, options, explanations, and answers)`,
      );
      return this.handleSuccess(null);
    } catch (error) {
      this.logger.error(`Unexpected error during quiz deletion:`, error);
      return this.handleError(error, 'deleteQuiz');
    }
  }

  async addQuestionsToQuiz(
    quizId: string,
    questionIds: string[],
  ): Promise<ApiResponse<QuizQuestionRow[]>> {
    try {
      if (!questionIds.length) {
        return this.handleSuccess([]);
      }

      const rows = questionIds.map((qid, idx) => ({
        quiz_id: quizId,
        question_id: qid,
        question_order: idx + 1,
      }));

      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.QUIZ_QUESTIONS)
        .insert(rows)
        .select();

      if (error) return this.handleError(error, 'addQuestionsToQuiz');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'addQuestionsToQuiz');
    }
  }

  async updateQuiz(quizId: string, input: any): Promise<ApiResponse<QuizRow>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.QUIZZES)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('quiz_id', quizId)
        .select()
        .single();

      if (error) return this.handleError(error, 'updateQuiz');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateQuiz');
    }
  }

  async getUserAnswers(
    userId: string,
    filters?: { quizId?: string; sessionId?: string; topicId?: string }
  ): Promise<ApiResponse<UserAnswerRow[]>> {
    try {
      this.logger.log(`📝 Getting user answers for user: ${userId}`);

      let query = this.supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .select('*')
        .eq('user_id', userId);

      if (filters?.quizId) {
        query = query.eq('quiz_id', filters.quizId);
      }

      if (filters?.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) return this.handleError(error, 'getUserAnswers');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getUserAnswers');
    }
  }
}
