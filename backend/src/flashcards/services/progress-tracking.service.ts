import { Injectable, Logger } from '@nestjs/common';

export interface MasteryCalculation {
  mastery_status: 'learning' | 'under_review' | 'mastered';
  consecutive_correct: number;
}

@Injectable()
export class ProgressTrackingService {
  private readonly logger = new Logger(ProgressTrackingService.name);

  /**
   * Magoosh-Style Mastery Algorithm
   *
   * Learning Flow:
   * 1. learning → under_review (first correct answer)
   * 2. under_review → mastered (2+ consecutive correct)
   * 3. Any incorrect answer from under_review/mastered → learning
   */
  calculateMasteryStatus(
    performance: 'know' | 'dont_know',
    currentMasteryStatus: 'learning' | 'under_review' | 'mastered',
    consecutiveCorrect: number,
  ): MasteryCalculation {
    let newMasteryStatus = currentMasteryStatus;
    let newConsecutiveCorrect = consecutiveCorrect;

    this.logger.debug(
      `Calculating mastery: performance=${performance}, current=${currentMasteryStatus}, streak=${consecutiveCorrect}`,
    );

    if (performance === 'know') {
      // User knows the card
      newConsecutiveCorrect = consecutiveCorrect + 1;

      if (currentMasteryStatus === 'learning') {
        // Learning → Under Review (first time they know it)
        newMasteryStatus = 'under_review';
        this.logger.debug('Promoted from learning to under_review');
      } else if (
        currentMasteryStatus === 'under_review' &&
        newConsecutiveCorrect >= 2
      ) {
        // Under Review → Mastered (confirmed they know it)
        newMasteryStatus = 'mastered';
        this.logger.debug('Promoted from under_review to mastered');
      }
      // If already mastered, stay mastered
    } else {
      // User doesn't know the card
      newConsecutiveCorrect = 0; // Reset streak

      if (
        currentMasteryStatus === 'under_review' ||
        currentMasteryStatus === 'mastered'
      ) {
        // Under Review/Mastered → Learning (they forgot it)
        newMasteryStatus = 'learning';
        this.logger.debug('Demoted to learning due to incorrect answer');
      }
      // If already learning, stay learning
    }

    return {
      mastery_status: newMasteryStatus,
      consecutive_correct: newConsecutiveCorrect,
    };
  }

  getMasteryMessage(
    performance: 'know' | 'dont_know',
    masteryStatus: 'learning' | 'under_review' | 'mastered',
  ): string {
    if (performance === 'know') {
      switch (masteryStatus) {
        case 'under_review':
          return 'Great! This card is now under review. Get it right once more to master it!';
        case 'mastered':
          return "Excellent! You've mastered this card! 🎉";
        default:
          return 'Good job! Keep practicing to improve your mastery.';
      }
    } else {
      switch (masteryStatus) {
        case 'learning':
          return 'No worries! This card is back in learning mode. Keep practicing!';
        default:
          return "Don't worry! Practice makes perfect.";
      }
    }
  }
}
