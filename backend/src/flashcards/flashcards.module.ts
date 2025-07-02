import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { AiFlashcardService } from './services/ai-flashcard.service';
import { ProgressTrackingService } from './services/progress-tracking.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FlashcardsController],
  providers: [FlashcardsService, AiFlashcardService, ProgressTrackingService],
})
export class FlashcardsModule {}
