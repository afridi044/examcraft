import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  DashboardStats,
  RecentActivity,
  TopicProgress,
} from '../../types/shared.types';

@Injectable()
export class AnalyticsDatabaseService extends BaseDatabaseService {
  
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
}
