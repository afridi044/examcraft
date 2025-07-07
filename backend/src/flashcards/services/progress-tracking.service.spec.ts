import { ProgressTrackingService, MasteryCalculation } from './progress-tracking.service';

describe('ProgressTrackingService', () => {
  let service: ProgressTrackingService;

  beforeEach(() => {
    service = new ProgressTrackingService();
  });

  describe('calculateMasteryStatus', () => {
    it('should promote from learning to under_review on first correct', () => {
      const result = service.calculateMasteryStatus('know', 'learning', 0);
      expect(result).toEqual({ mastery_status: 'under_review', consecutive_correct: 1 });
    });

    it('should promote from under_review to mastered after 2 consecutive correct', () => {
      // First correct: under_review, streak 1
      let result = service.calculateMasteryStatus('know', 'under_review', 1);
      expect(result).toEqual({ mastery_status: 'mastered', consecutive_correct: 2 });
    });

    it('should stay mastered on correct answer', () => {
      const result = service.calculateMasteryStatus('know', 'mastered', 5);
      expect(result).toEqual({ mastery_status: 'mastered', consecutive_correct: 6 });
    });

    it('should reset streak and demote to learning on incorrect from under_review', () => {
      const result = service.calculateMasteryStatus('dont_know', 'under_review', 2);
      expect(result).toEqual({ mastery_status: 'learning', consecutive_correct: 0 });
    });

    it('should reset streak and demote to learning on incorrect from mastered', () => {
      const result = service.calculateMasteryStatus('dont_know', 'mastered', 3);
      expect(result).toEqual({ mastery_status: 'learning', consecutive_correct: 0 });
    });

    it('should stay learning on incorrect from learning', () => {
      const result = service.calculateMasteryStatus('dont_know', 'learning', 0);
      expect(result).toEqual({ mastery_status: 'learning', consecutive_correct: 0 });
    });

    it('should increment streak in under_review but not promote if streak < 2', () => {
      const result = service.calculateMasteryStatus('know', 'under_review', 0);
      expect(result).toEqual({ mastery_status: 'under_review', consecutive_correct: 1 });
    });
  });

  describe('getMasteryMessage', () => {
    it('should return under_review message for know/under_review', () => {
      expect(service.getMasteryMessage('know', 'under_review')).toContain('under review');
    });
    it('should return mastered message for know/mastered', () => {
      expect(service.getMasteryMessage('know', 'mastered')).toContain('mastered');
    });
    it('should return generic good job for know/learning', () => {
      expect(service.getMasteryMessage('know', 'learning')).toContain('Good job');
    });
    it('should return learning message for dont_know/learning', () => {
      expect(service.getMasteryMessage('dont_know', 'learning')).toContain('learning mode');
    });
    it('should return practice message for dont_know/under_review', () => {
      expect(service.getMasteryMessage('dont_know', 'under_review')).toContain('Practice makes perfect');
    });
    it('should return practice message for dont_know/mastered', () => {
      expect(service.getMasteryMessage('dont_know', 'mastered')).toContain('Practice makes perfect');
    });
  });
}); 