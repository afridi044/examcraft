import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { QuizModule } from './quiz/quiz.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionsModule } from './questions/questions.module';
import { UsersModule } from './users/users.module';
import { ExamsModule } from './exams/exams.module';
import { AnswersModule } from './answers/answers.module';
import { NotesModule } from './notes/notes.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    HealthModule,
    QuizModule,
    FlashcardsModule,
    DatabaseModule,
    DashboardModule,
    AnalyticsModule,
    AuthModule,
    TopicsModule,
    QuestionsModule,
    UsersModule,
    ExamsModule,
    AnswersModule,
    NotesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
