import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { UserDatabaseService } from './services/user-database.service';
import { QuizDatabaseService } from './services/quiz-database.service';
import { FlashcardDatabaseService } from './services/flashcard-database.service';
import { ExamDatabaseService } from './services/exam-database.service';
import { QuestionDatabaseService } from './services/question-database.service';
import { AnalyticsDatabaseService } from './services/analytics-database.service';
import { QuizReviewDatabaseService } from './services/quiz-review-database.service';

@Module({
  providers: [
    DatabaseService,
    UserDatabaseService,
    QuizDatabaseService,
    FlashcardDatabaseService,
    ExamDatabaseService,
    QuestionDatabaseService,
    AnalyticsDatabaseService,
    QuizReviewDatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
