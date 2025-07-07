import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';
import { UserDatabaseService } from './services/user-database.service';
import { QuizDatabaseService } from './services/quiz-database.service';
import { FlashcardDatabaseService } from './services/flashcard-database.service';
import { ExamDatabaseService } from './services/exam-database.service';
import { QuestionDatabaseService } from './services/question-database.service';
import { AnalyticsDatabaseService } from './services/analytics-database.service';
import { QuizReviewDatabaseService } from './services/quiz-review-database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: UserDatabaseService, useValue: {} },
        { provide: QuizDatabaseService, useValue: {} },
        { provide: FlashcardDatabaseService, useValue: {} },
        { provide: ExamDatabaseService, useValue: {} },
        { provide: QuestionDatabaseService, useValue: {} },
        { provide: AnalyticsDatabaseService, useValue: {} },
        { provide: QuizReviewDatabaseService, useValue: {} },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
