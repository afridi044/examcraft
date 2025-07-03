import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ApiResponse,
  TABLE_NAMES,
  UserRow,
  TopicRow,
  QuizRow,
  FlashcardRow,
  QuestionRow,
  QuestionOptionRow,
  ExplanationRow,
  QuizQuestionRow,
  UserAnswerRow,
  QuestionWithOptions,
  QuizWithQuestions,
  DashboardStats,
  RecentActivity,
  TopicProgress,
  TablesInsert,
  TablesUpdate,
  Database,
  Tables,
} from '../types/shared.types';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private supabase: SupabaseClient<Database>;
  private supabaseAdmin: SupabaseClient<Database>; // Service role client for admin operations

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Debug logging
    this.logger.log('🔍 Environment Debug:');
    this.logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    this.logger.log(
      `SUPABASE_URL: ${process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]'}`,
    );

    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.anonKey');
    const supabaseServiceKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    this.logger.log(`🔧 Config Service Results:`);
    this.logger.log(`supabase.url: ${supabaseUrl ? '[FOUND]' : '[NOT FOUND]'}`);
    this.logger.log(
      `supabase.anonKey: ${supabaseKey ? '[FOUND]' : '[NOT FOUND]'}`,
    );
    this.logger.log(
      `supabase.serviceRoleKey: ${supabaseServiceKey ? '[FOUND]' : '[NOT FOUND]'}`,
    );

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase configuration is missing');
      throw new Error('Supabase configuration is missing');
    }

    // Initialize regular client with anon key
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // Initialize admin client with service role key (if available)
    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient<Database>(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            persistSession: false,
          },
        },
      );
      this.logger.log('✅ Supabase admin client initialized successfully');
    } else {
      this.logger.warn(
        '⚠️ Service role key not found - admin operations may fail due to RLS',
      );
      // Fallback to regular client for backward compatibility
      this.supabaseAdmin = this.supabase;
    }

    this.logger.log('✅ Supabase clients initialized successfully');

    // Test the connection
    const healthCheck = await this.checkHealth();
    this.logger.log(`Database health check: ${healthCheck.status}`);
  }

  private handleError<T>(error: unknown, operation: string): ApiResponse<T> {
    this.logger.error(`❌ ${operation} failed:`, error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }

  private handleSuccess<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      error: null,
    };
  }

  // =============================================
  // User Operations
  // =============================================

  async getCurrentUser(
    authUserId: string,
  ): Promise<ApiResponse<UserRow | null>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .select('*')
        .eq('supabase_auth_id', authUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No user found
          return this.handleSuccess(null);
        }
        return this.handleError(error, 'getCurrentUser');
      }

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getCurrentUser');
    }
  }

  async getUserByAuthId(
    authUserId: string,
  ): Promise<ApiResponse<UserRow | null>> {
    try {
      // Use admin client to bypass RLS policies for user lookup
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .select('*')
        .eq('supabase_auth_id', authUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No user found
          return this.handleSuccess(null);
        }
        return this.handleError(error, 'getUserByAuthId');
      }

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getUserByAuthId');
    }
  }

  async getUserById(userId: string): Promise<ApiResponse<UserRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return this.handleError(error, 'getUserById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getUserById');
    }
  }

  async createUser(
    input: Omit<TablesInsert<'users'>, 'password_hash'> & {
      password_hash?: string;
    },
  ): Promise<ApiResponse<UserRow>> {
    try {
      // Use admin client to bypass RLS policies for user creation
      const payload = { password_hash: '', ...input } as TablesInsert<'users'>;

      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .insert(payload)
        .select()
        .single();

      if (error) return this.handleError(error, 'createUser');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createUser');
    }
  }

  async updateUser(
    userId: string,
    input: TablesUpdate<'users'>,
  ): Promise<ApiResponse<UserRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return this.handleError(error, 'updateUser');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateUser');
    }
  }

  // =============================================
  // Quiz Operations
  // =============================================

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
        topic: { name: string } | { name: string }[] | null;
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
          topic:topics(name),
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
      const totalTime = (answersData || []).reduce(
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
                ? { name: maybeArray[0]?.name || '' }
                : undefined;
            }
            return { name: maybeArray.name };
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

  // =============================================
  // Quiz Deletion (used when AI generation fails to create questions)
  // =============================================

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

  // =============================================
  // Topic & Question Creation for AI Quiz Generate
  // =============================================

  async createTopic(
    input: TablesInsert<'topics'>,
  ): Promise<ApiResponse<TopicRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.TOPICS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createTopic');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createTopic');
    }
  }

  async createQuestion(
    input: TablesInsert<'questions'>,
  ): Promise<ApiResponse<QuestionRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.QUESTIONS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createQuestion');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createQuestion');
    }
  }

  async createQuestionOption(
    input: TablesInsert<'question_options'>,
  ): Promise<ApiResponse<QuestionOptionRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.QUESTION_OPTIONS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createQuestionOption');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createQuestionOption');
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

  async createExplanation(input: {
    question_id: string;
    content: string;
    ai_generated: boolean;
  }): Promise<ApiResponse<ExplanationRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXPLANATIONS)
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createExplanation');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createExplanation');
    }
  }

  // =============================================
  // Flashcard Helpers
  // =============================================

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

  async getQuestionWithCorrectAnswer(
    questionId: string,
  ): Promise<ApiResponse<{ question: QuestionRow; answer: string }>> {
    try {
      // Get question
      const { data: question, error: qErr } = await this.supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select('*')
        .eq('question_id', questionId)
        .single<QuestionRow>();

      if (qErr) return this.handleError(qErr, 'getQuestion');

      // Get correct option
      const { data: option, error: oErr } = await this.supabase
        .from(TABLE_NAMES.QUESTION_OPTIONS)
        .select('content')
        .eq('question_id', questionId)
        .eq('is_correct', true)
        .single();

      if (oErr) return this.handleError(oErr, 'getQuestionCorrectOption');

      return this.handleSuccess({ question, answer: option.content });
    } catch (error) {
      return this.handleError(error, 'getQuestionWithCorrectAnswer');
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

  async getFlashcardsByMastery(
    userId: string,
    masteryStatus: 'learning' | 'under_review' | 'mastered',
  ): Promise<ApiResponse<FlashcardRow[]>> {
    try {
      this.logger.log(
        `📚 Getting flashcards by mastery status: ${masteryStatus} for user: ${userId}`,
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
        .eq('mastery_status', masteryStatus)
        .order('created_at', { ascending: false });

      if (error) return this.handleError(error, 'getFlashcardsByMastery');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getFlashcardsByMastery');
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

  async getQuestionById(questionId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`❓ Getting question by ID: ${questionId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select(
          `
          *,
          question_options(*),
          topic:topics(*)
        `,
        )
        .eq('question_id', questionId)
        .single<QuestionRow>();

      if (error) return this.handleError(error, 'getQuestionById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getQuestionById');
    }
  }

  // =============================================
  // Analytics & Dashboard Operations
  // =============================================

  async getDashboardStats(
    userId: string,
  ): Promise<ApiResponse<DashboardStats>> {
    try {
      this.logger.log(`📊 Getting dashboard stats for user: ${userId}`);

      // Get dashboard statistics using multiple queries
      const [quizzesResult, examsResult, flashcardsResult, answersResult] =
        await Promise.all([
          // Get total quizzes
          this.supabase
            .from(TABLE_NAMES.QUIZZES)
            .select('quiz_id')
            .eq('user_id', userId),

          // Get total exams
          this.supabase
            .from(TABLE_NAMES.EXAMS)
            .select('exam_id')
            .eq('user_id', userId),

          // Get total flashcards
          this.supabase
            .from(TABLE_NAMES.FLASHCARDS)
            .select('flashcard_id')
            .eq('user_id', userId),

          // Get user answers for statistics (include quiz_id for proper scoring)
          this.supabase
            .from(TABLE_NAMES.USER_ANSWERS)
            .select('is_correct, created_at, quiz_id, question_id')
            .eq('user_id', userId),
        ]);

      if (
        quizzesResult.error ||
        examsResult.error ||
        flashcardsResult.error ||
        answersResult.error
      ) {
        return this.handleError(
          quizzesResult.error || examsResult.error || flashcardsResult.error || answersResult.error,
          'getDashboardStats',
        );
      }

      const totalQuizzes = quizzesResult.data?.length || 0;
      const totalExams = examsResult.data?.length || 0;
      const totalFlashcards = flashcardsResult.data?.length || 0;
      const answers = answersResult.data || [];

      // FIXED: Calculate proper quiz-based average score
      const { questionsAnswered, correctAnswers, averageScore } =
        this.calculateProperAverageScore(answers);

      // Calculate study streak (simplified version)
      const studyStreak = await this.calculateStudyStreak(userId);

      const dashboardStats: DashboardStats = {
        totalQuizzes,
        totalExams,
        totalFlashcards,
        averageScore, // Already rounded in calculateProperAverageScore
        studyStreak: studyStreak.data || 0,
        questionsAnswered,
        correctAnswers,
      };

      this.logger.log(
        `✅ Dashboard stats retrieved: ${JSON.stringify(dashboardStats)}`,
      );
      return this.handleSuccess(dashboardStats);
    } catch (error) {
      return this.handleError(error, 'getDashboardStats');
    }
  }

  async getRecentActivity(
    userId: string,
    limit: number = 10,
  ): Promise<ApiResponse<RecentActivity[]>> {
    try {
      this.logger.log(`📋 Getting recent activity for user: ${userId}`);

      // Type definition for recent activity query result
      interface RecentActivityQueryResult {
        quiz_id: string;
        title: string;
        created_at: string;
        topics: { name: string }[] | null;
      }

      // Get recent quiz activities
      const { data: recentQuizzes, error: quizError } = (await this.supabase
        .from(TABLE_NAMES.QUIZZES)
        .select(
          `
          quiz_id,
          title,
          created_at,
          topics(name)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)) as {
        data: RecentActivityQueryResult[] | null;
        error: any;
      };

      if (quizError) {
        return this.handleError(quizError, 'getRecentActivity');
      }

      // Convert to RecentActivity format
      const activities: RecentActivity[] = (recentQuizzes || []).map(
        (quiz) => ({
          id: quiz.quiz_id,
          type: 'quiz' as const,
          title: quiz.title,
          completed_at: quiz.created_at,
          topic: quiz.topics?.[0]?.name,
        }),
      );

      this.logger.log(`✅ Retrieved ${activities.length} recent activities`);
      return this.handleSuccess(activities);
    } catch (error) {
      return this.handleError(error, 'getRecentActivity');
    }
  }

  async getTopicProgress(
    userId: string,
  ): Promise<ApiResponse<TopicProgress[]>> {
    try {
      this.logger.log(`📈 Getting topic progress for user: ${userId}`);

      // Type definition for complex query result
      interface TopicProgressQueryResult {
        questions: {
          topic_id: string | null;
          topics: { name: string }[];
        } | null;
        is_correct: boolean | null;
        created_at: string;
      }

      // Get topic progress from user answers grouped by topic
      const { data, error } = (await this.supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .select(
          `
          questions!inner(topic_id, topics!inner(name)),
          is_correct,
          created_at
        `,
        )
        .eq('user_id', userId)) as {
        data: TopicProgressQueryResult[] | null;
        error: any;
      };

      if (error) {
        return this.handleError(error, 'getTopicProgress');
      }

      // Group answers by topic and calculate progress
      const topicMap = new Map<
        string,
        {
          topic_id: string;
          topic_name: string;
          total: number;
          correct: number;
          lastActivity: string;
        }
      >();

      (data || []).forEach((answer) => {
        const topicId = answer.questions?.topic_id;
        const topicName = answer.questions?.topics?.[0]?.name;

        if (topicId && topicName) {
          const existing = topicMap.get(topicId) || {
            topic_id: topicId,
            topic_name: topicName,
            total: 0,
            correct: 0,
            lastActivity: answer.created_at,
          };

          existing.total++;
          if (answer.is_correct) existing.correct++;
          if (answer.created_at > existing.lastActivity) {
            existing.lastActivity = answer.created_at;
          }

          topicMap.set(topicId, existing);
        }
      });

      // Convert to TopicProgress format
      const topicProgress: TopicProgress[] = Array.from(topicMap.values()).map(
        (topic) => ({
          topic_id: topic.topic_id,
          topic_name: topic.topic_name,
          progress_percentage:
            topic.total > 0
              ? Math.round((topic.correct / topic.total) * 100)
              : 0,
          questions_attempted: topic.total,
          questions_correct: topic.correct,
          last_activity: topic.lastActivity,
        }),
      );

      this.logger.log(
        `✅ Retrieved progress for ${topicProgress.length} topics`,
      );
      return this.handleSuccess(topicProgress);
    } catch (error) {
      return this.handleError(error, 'getTopicProgress');
    }
  }

  /**
   * Calculate proper quiz-based average score
   * Groups answers by quiz and calculates the average of quiz scores, not individual questions
   */
  private calculateProperAverageScore(
    answers: {
      is_correct: boolean | null;
      quiz_id: string | null;
      question_id: string | null;
      created_at: string;
    }[],
  ): {
    questionsAnswered: number;
    correctAnswers: number;
    averageScore: number;
  } {
    // Filter to only quiz answers (exclude flashcard answers)
    const quizAnswers = answers.filter((a) => a.quiz_id);

    if (quizAnswers.length === 0) {
      return {
        questionsAnswered: 0,
        correctAnswers: 0,
        averageScore: 0,
      };
    }

    // Deduplicate answers by quiz_id + question_id, keep the latest created_at
    const latestAnswerMap = new Map<string, typeof answers[0]>();
    quizAnswers.forEach((ans) => {
      if (!ans.quiz_id || !ans.question_id) return;
      const key = `${ans.quiz_id}-${ans.question_id}`;
      const existing = latestAnswerMap.get(key);
      if (!existing || ans.created_at > existing.created_at) {
        latestAnswerMap.set(key, ans);
      }
    });

    const dedupedAnswers = Array.from(latestAnswerMap.values());

    // Group answers by quiz_id
    const quizScores = new Map<string, { total: number; correct: number }>();

    dedupedAnswers.forEach((answer) => {
      const quizId = answer.quiz_id;
      if (!quizId) return; // Skip if no quiz_id

      const existing = quizScores.get(quizId) || { total: 0, correct: 0 };

      existing.total++;
      if (answer.is_correct) {
        existing.correct++;
      }

      quizScores.set(quizId, existing);
    });

    // Calculate individual quiz scores and overall average
    const quizScorePercentages: number[] = [];
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;

    quizScores.forEach((quiz) => {
      const quizPercentage =
        quiz.total > 0 ? (quiz.correct / quiz.total) * 100 : 0;
      quizScorePercentages.push(quizPercentage);
      totalQuestionsAnswered += quiz.total;
      totalCorrectAnswers += quiz.correct;
    });

    // Calculate average of quiz scores (proper method)
    const averageScore =
      quizScorePercentages.length > 0
        ? quizScorePercentages.reduce((sum, score) => sum + score, 0) /
          quizScorePercentages.length
        : 0;

    this.logger.log(
      `📊 Score calculation: ${quizScores.size} quizzes, avg: ${Math.round(averageScore)}%`,
    );

    return {
      questionsAnswered: totalQuestionsAnswered,
      correctAnswers: totalCorrectAnswers,
      averageScore: Math.round(averageScore),
    };
  }

  async calculateStudyStreak(userId: string): Promise<ApiResponse<number>> {
    try {
      // Get user activity dates (simplified calculation)
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error, 'calculateStudyStreak');
      }

      if (!data || data.length === 0) {
        return this.handleSuccess(0);
      }

      // Simple streak calculation - count consecutive days
      const dates = data.map((d) => d.created_at.split('T')[0]); // Get date part only
      const uniqueDates = [...new Set(dates)].sort().reverse();

      let streak = 0;

      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (uniqueDates[i] === expectedDateStr) {
          streak++;
        } else {
          break;
        }
      }

      return this.handleSuccess(streak);
    } catch (error) {
      return this.handleError(error, 'calculateStudyStreak');
    }
  }

  // OPTIMIZED: Get all dashboard data in one call
  async getAllDashboardData(userId: string): Promise<
    ApiResponse<{
      stats: DashboardStats;
      recentActivity: RecentActivity[];
      topicProgress: TopicProgress[];
    }>
  > {
    try {
      this.logger.log(`🚀 Getting ALL dashboard data for user: ${userId}`);

      const [statsResult, activityResult, progressResult] = await Promise.all([
        this.getDashboardStats(userId),
        this.getRecentActivity(userId),
        this.getTopicProgress(userId),
      ]);

      if (
        !statsResult.success ||
        !activityResult.success ||
        !progressResult.success
      ) {
        return this.handleError(
          statsResult.error || activityResult.error || progressResult.error,
          'getAllDashboardData',
        );
      }

      const result = {
        stats: statsResult.data!,
        recentActivity: activityResult.data!,
        topicProgress: progressResult.data!,
      };

      this.logger.log(`✅ Successfully retrieved all dashboard data`);
      return this.handleSuccess(result);
    } catch (error) {
      return this.handleError(error, 'getAllDashboardData');
    }
  }

  // =============================================
  // Exam Operations
  // =============================================

  async createExam(
    input: TablesInsert<'exams'>,
    questionIds: string[] = [],
  ): Promise<ApiResponse<Tables<'exams'>>> {
    try {
      this.logger.log(`📝 Creating exam: ${input.title}`);

      // Start transaction
      const { data: exam, error: examError } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXAMS)
        .insert(input)
        .select()
        .single();

      if (examError) return this.handleError(examError, 'createExam - exam');

      // Add questions to exam if provided
      if (questionIds.length > 0) {
        const examQuestions = questionIds.map((questionId, index) => ({
          exam_id: exam.exam_id,
          question_id: questionId,
          question_order: index + 1,
          points: 1, // Default points per question
        }));

        const { error: questionsError } = await this.supabaseAdmin
          .from('exam_questions')
          .insert(examQuestions);

        if (questionsError) {
          // Rollback: delete the exam
          await this.supabaseAdmin
            .from(TABLE_NAMES.EXAMS)
            .delete()
            .eq('exam_id', exam.exam_id);
          return this.handleError(questionsError, 'createExam - questions');
        }
      }

      this.logger.log(
        `✅ Created exam ${exam.exam_id} with ${questionIds.length} questions`,
      );
      return this.handleSuccess(exam);
    } catch (error) {
      return this.handleError(error, 'createExam');
    }
  }

  async getExamById(examId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`🔍 Getting exam: ${examId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.EXAMS)
        .select(
          `
          *,
          topic:topics(*),
          exam_questions!inner(
            question_order,
            points,
            questions(
              *,
              question_options(*),
              explanations(content)
            )
          )
        `,
        )
        .eq('exam_id', examId)
        .single();

      if (error) return this.handleError(error, 'getExamById');

      // Transform the data to a more usable format
      const { exam_questions, ...examData } = data;
      const transformedExam = {
        ...examData,
        questions: exam_questions
          ?.map((eq: any) => ({
            question_id: eq.questions.question_id,
            question_order: eq.question_order,
            points: eq.points,
            question: eq.questions,
          }))
          .sort((a: any, b: any) => a.question_order - b.question_order),
        total_questions: exam_questions?.length || 0,
        total_points:
          exam_questions?.reduce(
            (sum: number, eq: any) => sum + eq.points,
            0,
          ) || 0,
      };

      return this.handleSuccess(transformedExam);
    } catch (error) {
      return this.handleError(error, 'getExamById');
    }
  }

  async getUserExams(userId: string): Promise<ApiResponse<any[]>> {
    try {
      this.logger.log(`📚 Getting exams for user: ${userId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.EXAMS)
        .select(
          `
          *,
          topic:topics(topic_id, name),
          exam_questions(points)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return this.handleError(error, 'getUserExams');

      // Transform data to include calculated fields
      const transformedExams = (data || []).map((exam) => ({
        ...exam,
        total_questions: exam.exam_questions?.length || 0,
        total_points:
          exam.exam_questions?.reduce(
            (sum, eq) => sum + (eq.points || 1),
            0,
          ) || 0,
        exam_questions: undefined, // Remove from response
      }));

      return this.handleSuccess(transformedExams);
    } catch (error) {
      return this.handleError(error, 'getUserExams');
    }
  }

  async updateExam(
    examId: string,
    input: TablesUpdate<'exams'>,
    questionIds?: string[],
  ): Promise<ApiResponse<Tables<'exams'>>> {
    try {
      this.logger.log(`📝 Updating exam: ${examId}`);

      // Update exam
      const { data: exam, error: examError } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXAMS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('exam_id', examId)
        .select()
        .single();

      if (examError) return this.handleError(examError, 'updateExam - exam');

      // Update questions if provided
      if (questionIds) {
        // Delete existing question associations
        const { error: deleteError } = await this.supabaseAdmin
          .from('exam_questions')
          .delete()
          .eq('exam_id', examId);

        if (deleteError)
          return this.handleError(deleteError, 'updateExam - delete questions');

        // Add new question associations
        if (questionIds.length > 0) {
          const examQuestions = questionIds.map((questionId, index) => ({
            exam_id: examId,
            question_id: questionId,
            question_order: index + 1,
            points: 1,
          }));

          const { error: insertError } = await this.supabaseAdmin
            .from('exam_questions')
            .insert(examQuestions);

          if (insertError)
            return this.handleError(insertError, 'updateExam - insert questions');
        }
      }

      return this.handleSuccess(exam);
    } catch (error) {
      return this.handleError(error, 'updateExam');
    }
  }

  async deleteExam(examId: string): Promise<ApiResponse<boolean>> {
    try {
      this.logger.log(`🗑️ Deleting exam: ${examId}`);

      // Get exam questions first for cleanup
      const { data: examQuestions } = await this.supabase
        .from('exam_questions')
        .select('question_id')
        .eq('exam_id', examId);

      const questionIds = examQuestions?.map((eq) => eq.question_id) || [];

      // Delete exam (cascades to exam_questions and exam_sessions)
      const { error: examError } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXAMS)
        .delete()
        .eq('exam_id', examId);

      if (examError) return this.handleError(examError, 'deleteExam');

      this.logger.log(
        `✅ Successfully deleted exam ${examId} with ${questionIds.length} questions`,
      );
      return this.handleSuccess(true);
    } catch (error) {
      return this.handleError(error, 'deleteExam');
    }
  }

  async getExamSessions(
    userId: string,
    examId?: string,
  ): Promise<ApiResponse<any[]>> {
    try {
      this.logger.log(
        `📊 Getting exam sessions for user: ${userId}${examId ? `, exam: ${examId}` : ''}`,
      );

      let query = this.supabase
        .from('exam_sessions')
        .select(
          `
          *,
          exam:exams(title, duration_minutes, passing_score),
          exam_analytics(*)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (examId) {
        query = query.eq('exam_id', examId);
      }

      const { data, error } = await query;

      if (error) return this.handleError(error, 'getExamSessions');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getExamSessions');
    }
  }

  async createExamSession(
    input: TablesInsert<'exam_sessions'>,
  ): Promise<ApiResponse<Tables<'exam_sessions'>>> {
    try {
      this.logger.log(`🚀 Starting exam session for exam: ${input.exam_id}`);

      const { data, error } = await this.supabaseAdmin
        .from('exam_sessions')
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createExamSession');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createExamSession');
    }
  }

  async updateExamSession(
    sessionId: string,
    input: TablesUpdate<'exam_sessions'>,
  ): Promise<ApiResponse<Tables<'exam_sessions'>>> {
    try {
      this.logger.log(`📊 Updating exam session: ${sessionId}`);

      const { data, error } = await this.supabaseAdmin
        .from('exam_sessions')
        .update(input)
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) return this.handleError(error, 'updateExamSession');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateExamSession');
    }
  }

  async getExamSessionById(
    sessionId: string,
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`🔍 Getting exam session: ${sessionId}`);

      const { data, error } = await this.supabase
        .from('exam_sessions')
        .select(
          `
          *,
          exam:exams(*),
          exam_analytics(*)
        `,
        )
        .eq('session_id', sessionId)
        .single();

      if (error) return this.handleError(error, 'getExamSessionById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getExamSessionById');
    }
  }

  // =============================================
  // Health Check
  // =============================================

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      // Test a simple query to Supabase
      const { error } = await this.supabase
        .from(TABLE_NAMES.USERS)
        .select('user_id')
        .limit(1);

      return {
        status: error ? 'unhealthy' : 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async deleteFlashcard(flashcardId: string): Promise<ApiResponse<boolean>> {
    try {
      this.logger.log(`🗑️ Deleting flashcard: ${flashcardId}`);
      const { error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .delete()
        .eq('flashcard_id', flashcardId);

      if (error) return this.handleError(error, 'deleteFlashcard');
      return this.handleSuccess(true);
    } catch (error) {
      return this.handleError(error, 'deleteFlashcard');
    }
  }

  async getFlashcardsDueForReview(
    userId: string,
  ): Promise<ApiResponse<FlashcardRow[]>> {
    try {
      this.logger.log(`⏰ Getting due flashcards for user: ${userId}`);

      const today = new Date().toISOString();
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(`*, topic:topics(*)`)
        .eq('user_id', userId)
        .lte('next_review_date', today)
        .order('next_review_date', { ascending: true });

      if (error) return this.handleError(error, 'getFlashcardsDueForReview');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getFlashcardsDueForReview');
    }
  }

  // =============================================
  // Topic Operations
  // =============================================

  async getAllTopics(): Promise<ApiResponse<TopicRow[]>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select('*')
        .order('name');
      if (error) return this.handleError(error, 'getAllTopics');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getAllTopics');
    }
  }

  async getTopicById(topicId: string): Promise<ApiResponse<TopicRow>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .select('*')
        .eq('topic_id', topicId)
        .single();
      if (error) return this.handleError(error, 'getTopicById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getTopicById');
    }
  }

  async updateTopic(
    topicId: string,
    input: TablesUpdate<'topics'>,
  ): Promise<ApiResponse<TopicRow>> {
    try {
      const { data, error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .update({ ...input })
        .eq('topic_id', topicId)
        .select()
        .single();
      if (error) return this.handleError(error, 'updateTopic');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateTopic');
    }
  }

  async deleteTopic(topicId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from(TABLE_NAMES.TOPICS)
        .delete()
        .eq('topic_id', topicId);
      if (error) return this.handleError(error, 'deleteTopic');
      return this.handleSuccess(true);
    } catch (error) {
      return this.handleError(error, 'deleteTopic');
    }
  }

  // =============================================
  // Question Read Helpers
  // =============================================

  async getQuestionsWithOptions(filters?: {
    topicId?: string;
    difficulty?: number;
    questionType?: string;
    limit?: number;
  }): Promise<ApiResponse<QuestionWithOptions[]>> {
    try {
      this.logger.log(
        `📚 Getting questions with filters: ${JSON.stringify(filters)}`,
      );

      // Build query with proper typing
      let query = this.supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select(
          `
          *,
          question_options(*),
          topic:topics(*),
          explanations(content)
        `,
        )
        .order('created_at', { ascending: false });

      if (filters?.topicId) {
        query = query.eq('topic_id', filters.topicId);
      }
      if (typeof filters?.difficulty === 'number') {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters?.questionType) {
        query = query.eq('question_type', filters.questionType);
      }
      if (typeof filters?.limit === 'number' && filters.limit > 0) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) return this.handleError(error, 'getQuestionsWithOptions');
      return this.handleSuccess((data as QuestionWithOptions[]) || []);
    } catch (error) {
      return this.handleError(error, 'getQuestionsWithOptions');
    }
  }

  async updateQuiz(
    quizId: string,
    input: TablesUpdate<'quizzes'>,
  ): Promise<ApiResponse<QuizRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
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

  // =============================================
  // User Answers Operations
  // =============================================

  async getUserAnswers(
    userId: string,
    filters?: { quizId?: string; sessionId?: string; topicId?: string },
  ): Promise<ApiResponse<Tables<'user_answers'>[]>> {
    try {
      this.logger.log(`📥 Fetching user answers for user: ${userId}`);

      let data: Tables<'user_answers'>[] | null;
      let error: any;

      // Handle topic filtering separately due to different query structure
      if (filters?.topicId) {
        const result = await this.supabase
          .from(TABLE_NAMES.USER_ANSWERS)
          .select('*, questions!inner(topic_id)')
          .eq('user_id', userId)
          .eq('questions.topic_id', filters.topicId);

        data =
          result.data?.map((item: any) => {
            // Remove the joined questions data to match return type
            const { questions, ...userAnswer } = item;
            // questions is intentionally unused - we only need the user answer data
            return userAnswer as Tables<'user_answers'>;
          }) || null;
        error = result.error;
      } else {
        // Build standard query
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

        const result = await query;
        data = result.data;
        error = result.error;
      }

      if (error) return this.handleError(error, 'getUserAnswers');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getUserAnswers');
    }
  }
}
