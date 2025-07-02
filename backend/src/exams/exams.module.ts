import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ExamsService],
  controllers: [ExamsController],
})
export class ExamsModule {}
