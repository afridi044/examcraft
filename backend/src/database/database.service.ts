import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseDatabaseService } from './services/base-database.service';
import { UserDatabaseService } from './services/user-database.service';
import { QuizDatabaseService } from './services/quiz-database.service';
import { FlashcardDatabaseService } from './services/flashcard-database.service';
import { ExamDatabaseService } from './services/exam-database.service';
import { QuestionDatabaseService } from './services/question-database.service';
import { AnalyticsDatabaseService } from './services/analytics-database.service';
import { QuizReviewDatabaseService } from './services/quiz-review-database.service';
import { NotesDatabaseService } from './services/notes-database.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private baseDatabaseService: BaseDatabaseService;

  constructor(
    private configService: ConfigService,
    private userService: UserDatabaseService,
    private quizService: QuizDatabaseService,
    private flashcardService: FlashcardDatabaseService,
    private examService: ExamDatabaseService,
    private questionService: QuestionDatabaseService,
    private analyticsService: AnalyticsDatabaseService,
    private quizReviewService: QuizReviewDatabaseService,
    private notesService: NotesDatabaseService,
  ) {
    this.baseDatabaseService = new BaseDatabaseService(configService);
  }

  async onModuleInit() {
    // Initialize all services with the base configuration
    await this.baseDatabaseService.initializeClients();

    // Share the initialized clients with all other services
    const { supabase, supabaseAdmin } = this.baseDatabaseService as any;

    // Set clients for all services
    [
      this.userService,
      this.quizService,
      this.flashcardService,
      this.examService,
      this.questionService,
      this.analyticsService,
      this.quizReviewService,
      this.notesService,
    ].forEach(service => {
      (service as any).supabase = supabase;
      (service as any).supabaseAdmin = supabaseAdmin;
    });

    // Test the connection
    const healthCheck = await this.checkHealth();
    console.log(`Database health check: ${healthCheck.status}`);
  }

  // Health Check
  async checkHealth() {
    return this.baseDatabaseService.checkHealth();
  }

  // =============================================
  // User Operations - Delegate to UserDatabaseService
  // =============================================
  async getCurrentUser(authUserId: string) {
    return this.userService.getCurrentUser(authUserId);
  }

  async getUserByAuthId(authUserId: string) {
    return this.userService.getUserByAuthId(authUserId);
  }



  async createUser(input: any) {
    return this.userService.createUser(input);
  }

  async updateUser(userId: string, input: any) {
    return this.userService.updateUser(userId, input);
  }

  // =============================================
  // Quiz Operations - Delegate to QuizDatabaseService
  // =============================================
  async getUserQuizzes(userId: string) {
    return this.quizService.getUserQuizzes(userId);
  }

  async getUserQuizAttempts(userId: string) {
    return this.quizService.getUserQuizAttempts(userId);
  }

  async recordQuizCompletion(
    userId: string,
    quizId: string,
    completionData: {
      totalQuestions: number;
      answeredQuestions: number;
      correctAnswers: number;
      scorePercentage: number;
      timeSpentSeconds: number;
      wasAutoSubmitted: boolean;
    }
  ) {
    return this.quizService.recordQuizCompletion(userId, quizId, completionData);
  }

  async searchQuizzes(query: string, userId: string) {
    return this.quizService.searchQuizzes(query, userId);
  }

  async getQuizWithQuestions(quizId: string) {
    return this.quizService.getQuizWithQuestions(quizId);
  }

  async createQuiz(input: any) {
    return this.quizService.createQuiz(input);
  }

  async submitAnswer(input: any) {
    return this.quizService.submitAnswer(input);
  }

  async deleteQuiz(quizId: string) {
    return this.quizService.deleteQuiz(quizId);
  }

  async addQuestionsToQuiz(quizId: string, questionIds: string[]) {
    return this.quizService.addQuestionsToQuiz(quizId, questionIds);
  }

  async updateQuiz(quizId: string, input: any) {
    return this.quizService.updateQuiz(quizId, input);
  }

  async getUserAnswers(userId: string, filters?: any) {
    return this.quizService.getUserAnswers(userId, filters);
  }

  // =============================================
  // Quiz Review - Delegate to QuizReviewDatabaseService
  // =============================================
  async getQuizReview(quizId: string, userId: string) {
    return this.quizReviewService.getQuizReview(quizId, userId);
  }

  // =============================================
  // Flashcard Operations - Delegate to FlashcardDatabaseService
  // =============================================
  async createFlashcard(input: any) {
    return this.flashcardService.createFlashcard(input);
  }

  async getFlashcardByUserAndSourceQuestion(userId: string, questionId: string) {
    return this.flashcardService.getFlashcardByUserAndSourceQuestion(userId, questionId);
  }

  async getFlashcardsByUserAndQuestionIds(userId: string, questionIds: string[]) {
    return this.flashcardService.getFlashcardsByUserAndQuestionIds(userId, questionIds);
  }

  async getUserFlashcards(userId: string) {
    return this.flashcardService.getUserFlashcards(userId);
  }

  async searchFlashcards(query: string, userId: string) {
    return this.flashcardService.searchFlashcards(query, userId);
  }

  async getFlashcardById(flashcardId: string) {
    return this.flashcardService.getFlashcardById(flashcardId);
  }

  async updateFlashcard(flashcardId: string, updateData: any) {
    return this.flashcardService.updateFlashcard(flashcardId, updateData);
  }



  async getFlashcardsByTopic(userId: string, topicId: string) {
    return this.flashcardService.getFlashcardsByTopic(userId, topicId);
  }

  async getFlashcardsByTopicAndMastery(userId: string, topicId: string, masteryStatus: any) {
    return this.flashcardService.getFlashcardsByTopicAndMastery(userId, topicId, masteryStatus);
  }

  async deleteFlashcard(flashcardId: string, userId: string) {
    return this.flashcardService.deleteFlashcard(flashcardId, userId);
  }

  async getFlashcardsDueForReview(userId: string) {
    return this.flashcardService.getFlashcardsDueForReview(userId);
  }

  // =============================================
  // Exam Operations - Delegate to ExamDatabaseService
  // =============================================
  async createExam(input: any, questionIds: string[] = []) {
    return this.examService.createExam(input, questionIds);
  }

  async getExamById(examId: string) {
    return this.examService.getExamById(examId);
  }

  async getUserExams(userId: string) {
    return this.examService.getUserExams(userId);
  }

  async updateExam(examId: string, input: any, questionIds?: string[]) {
    return this.examService.updateExam(examId, input, questionIds);
  }

  async deleteExam(examId: string) {
    return this.examService.deleteExam(examId);
  }

  async getExamSessions(userId: string, examId?: string) {
    return this.examService.getExamSessions(userId, examId);
  }

  async createExamSession(input: any) {
    return this.examService.createExamSession(input);
  }

  async updateExamSession(sessionId: string, input: any) {
    return this.examService.updateExamSession(sessionId, input);
  }

  async getExamSessionById(sessionId: string) {
    return this.examService.getExamSessionById(sessionId);
  }

  // =============================================
  // Question & Topic Operations - Delegate to QuestionDatabaseService
  // =============================================
  async createTopic(input: any) {
    return this.questionService.createTopic(input);
  }

  async createQuestion(input: any) {
    return this.questionService.createQuestion(input);
  }

  async createQuestionOption(input: any) {
    return this.questionService.createQuestionOption(input);
  }

  async createExplanation(input: any) {
    return this.questionService.createExplanation(input);
  }



  async getQuestionById(questionId: string) {
    return this.questionService.getQuestionById(questionId);
  }

  async getQuestionsWithOptions(filters?: any) {
    return this.questionService.getQuestionsWithOptions(filters);
  }

  async getAllTopics() {
    return this.questionService.getAllTopics();
  }

  async getTopicsWithSubtopicCount() {
    return this.questionService.getTopicsWithSubtopicCount();
  }

  async findSubtopicByNameAndParent(subtopicName: string, parentTopicId: string) {
    return this.questionService.findSubtopicByNameAndParent(subtopicName, parentTopicId);
  }

  async createSubtopic(subtopicName: string, parentTopicId: string) {
    return this.questionService.createSubtopic(subtopicName, parentTopicId);
  }

  async getTopicById(topicId: string) {
    return this.questionService.getTopicById(topicId);
  }

  async updateTopic(topicId: string, input: any) {
    return this.questionService.updateTopic(topicId, input);
  }

  async deleteTopic(topicId: string) {
    return this.questionService.deleteTopic(topicId);
  }

  // =============================================
  // Analytics Operations - Delegate to AnalyticsDatabaseService
  // =============================================
  async getDashboardStats(userId: string) {
    return this.analyticsService.getDashboardStats(userId);
  }

  async getRecentActivity(userId: string, limit?: number) {
    return this.analyticsService.getRecentActivity(userId, limit);
  }

  async getTopicProgress(userId: string) {
    return this.analyticsService.getTopicProgress(userId);
  }

  async getAllTopicProgress(userId: string) {
    return this.analyticsService.getAllTopicProgress(userId);
  }

  async calculateStudyStreak(userId: string) {
    return this.analyticsService.calculateStudyStreak(userId);
  }

  async getAllDashboardData(userId: string) {
    return this.analyticsService.getAllDashboardData(userId);
  }

  // =============================================
  // Advanced Analytics Operations - Delegate to AnalyticsDatabaseService
  // =============================================
  async getUserProgressOverTime(userId: string, dateRange?: { from: Date; to: Date }) {
    return this.analyticsService.getUserProgressOverTime(userId, dateRange);
  }

  async getUserActivityHeatmap(userId: string, year?: number) {
    return this.analyticsService.getUserActivityHeatmap(userId, year);
  }

  async getUserAccuracyBreakdown(userId: string) {
    return this.analyticsService.getUserAccuracyBreakdown(userId);
  }

  async getUserQuizPerformanceTrend(userId: string) {
    return this.analyticsService.getUserQuizPerformanceTrend(userId);
  }

  async getUserFlashcardAnalytics(userId: string) {
    return this.analyticsService.getUserFlashcardAnalytics(userId);
  }

  async getUserBestWorstTopics(userId: string) {
    return this.analyticsService.getUserBestWorstTopics(userId);
  }

  // =============================================
  // Notes Operations - Delegate to NotesDatabaseService
  // =============================================
  async getUserNotes(userId: string) {
    return this.notesService.getUserNotes(userId);
  }

  async getNoteById(noteId: string, userId: string) {
    return this.notesService.getNoteById(noteId, userId);
  }

  async createNote(input: any) {
    return this.notesService.createNote(input);
  }

  async updateNote(noteId: string, input: any, userId: string) {
    return this.notesService.updateNote(noteId, input, userId);
  }

  async deleteNote(noteId: string, userId: string) {
    return this.notesService.deleteNote(noteId, userId);
  }
  // =============================================
  // Study Time Analytics - Delegate to AnalyticsDatabaseService
  // =============================================
  async getUserTotalStudyTime(userId: string) {
    return this.analyticsService.getUserTotalStudyTime(userId);

  }
}
