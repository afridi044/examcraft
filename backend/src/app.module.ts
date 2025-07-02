import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { QuizModule } from './quiz/quiz.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { TopicsModule } from './topics/topics.module';
import { QuestionsModule } from './questions/questions.module';
import { UsersModule } from './users/users.module';
import { ExamsModule } from './exams/exams.module';
import { AnswersModule } from './answers/answers.module';
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
    AuthModule,
    TopicsModule,
    QuestionsModule,
    UsersModule,
    ExamsModule,
    AnswersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
