import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';

@Module({
  imports: [DatabaseModule],
  providers: [AnswersService],
  controllers: [AnswersController],
})
export class AnswersModule {}
