import { FlashcardDatabaseService } from '../services/flashcard-database.service';
import { TABLE_NAMES } from '../../types/shared.types';

describe('FlashcardDatabaseService', () => {
  let service: FlashcardDatabaseService;
  let supabase: any;
  let supabaseAdmin: any;
  let mockLogger: any;
  let mockConfigService: any;

  beforeEach(() => {
    supabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };
    supabaseAdmin = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    mockConfigService = { get: jest.fn() };
    service = new FlashcardDatabaseService(mockConfigService as any);
    (service as any).supabase = supabase;
    (service as any).supabaseAdmin = supabaseAdmin;
    (service as any).logger = mockLogger;
  });

  describe('createFlashcard', () => {
    it('should create a flashcard successfully', async () => {
      const input = { user_id: 'u1', source_question_id: 'q1' };
      const mockData = { flashcard_id: 'f1', ...input };
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });
      const result = await service.createFlashcard(input as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
          })
        })
      });
      const result = await service.createFlashcard({} as any);
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabaseAdmin.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.createFlashcard({} as any);
      expect(result.success).toBe(false);
    });
  });

  describe('getFlashcardByUserAndSourceQuestion', () => {
    it('should return flashcard if found', async () => {
      const mockData = { flashcard_id: 'f1', user_id: 'u1', source_question_id: 'q1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });
      const result = await service.getFlashcardByUserAndSourceQuestion('u1', 'q1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should return null if not found (PGRST116)', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
            })
          })
        })
      });
      const result = await service.getFlashcardByUserAndSourceQuestion('u1', 'q1');
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: null, error: { code: 'OTHER' } })
            })
          })
        })
      });
      const result = await service.getFlashcardByUserAndSourceQuestion('u1', 'q1');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getFlashcardByUserAndSourceQuestion('u1', 'q1');
      expect(result.success).toBe(false);
    });
  });

  describe('getFlashcardsByUserAndQuestionIds', () => {
    it('should return ids for found flashcards', async () => {
      const mockData = [{ source_question_id: 'q1' }, { source_question_id: 'q2' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            in: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });
      const result = await service.getFlashcardsByUserAndQuestionIds('u1', ['q1', 'q2']);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['q1', 'q2']);
    });
    it('should return empty array for empty input', async () => {
      const result = await service.getFlashcardsByUserAndQuestionIds('u1', []);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            in: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
          })
        })
      });
      const result = await service.getFlashcardsByUserAndQuestionIds('u1', ['q1']);
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getFlashcardsByUserAndQuestionIds('u1', ['q1']);
      expect(result.success).toBe(false);
    });
  });

  describe('getUserFlashcards', () => {
    it('should return user flashcards', async () => {
      const mockData = [{ flashcard_id: 'f1' }, { flashcard_id: 'f2' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });
      const result = await service.getUserFlashcards('u1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
          })
        })
      });
      const result = await service.getUserFlashcards('u1');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getUserFlashcards('u1');
      expect(result.success).toBe(false);
    });
  });

  describe('getFlashcardById', () => {
    it('should return flashcard by id', async () => {
      const mockData = { flashcard_id: 'f1' };
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });
      const result = await service.getFlashcardById('f1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
          })
        })
      });
      const result = await service.getFlashcardById('f1');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getFlashcardById('f1');
      expect(result.success).toBe(false);
    });
  });

  describe('updateFlashcard', () => {
    it('should update flashcard', async () => {
      const mockData = { flashcard_id: 'f1' };
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });
      const result = await service.updateFlashcard('f1', { content: 'new' } as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
            })
          })
        })
      });
      const result = await service.updateFlashcard('f1', { content: 'new' } as any);
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.updateFlashcard('f1', { content: 'new' } as any);
      expect(result.success).toBe(false);
    });
  });

  describe('getFlashcardsByMastery', () => {
    it('should return flashcards by mastery', async () => {
      const mockData = [{ flashcard_id: 'f1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });
      const result = await service.getFlashcardsByMastery('u1', 'learning');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
            })
          })
        })
      });
      const result = await service.getFlashcardsByMastery('u1', 'learning');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getFlashcardsByMastery('u1', 'learning');
      expect(result.success).toBe(false);
    });
  });

  describe('getFlashcardsByTopic', () => {
    it('should return flashcards by topic', async () => {
      const mockData = [{ flashcard_id: 'f1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });
      const result = await service.getFlashcardsByTopic('u1', 't1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
            })
          })
        })
      });
      const result = await service.getFlashcardsByTopic('u1', 't1');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getFlashcardsByTopic('u1', 't1');
      expect(result.success).toBe(false);
    });
  });

  describe('getFlashcardsByTopicAndMastery', () => {
    it('should return flashcards by topic and mastery', async () => {
      const mockData = [{ flashcard_id: 'f1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              eq: jest.fn().mockReturnValueOnce({
                order: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
              })
            })
          })
        })
      });
      const result = await service.getFlashcardsByTopicAndMastery('u1', 't1', 'learning');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              eq: jest.fn().mockReturnValueOnce({
                order: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
              })
            })
          })
        })
      });
      const result = await service.getFlashcardsByTopicAndMastery('u1', 't1', 'learning');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getFlashcardsByTopicAndMastery('u1', 't1', 'learning');
      expect(result.success).toBe(false);
    });
  });

  describe('deleteFlashcard', () => {
    it('should delete flashcard successfully', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: { flashcard_id: 'f1', user_id: 'u1' }, error: null })
          })
        })
      });
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({ error: null })
        })
      });
      const result = await service.deleteFlashcard('f1', 'u1');
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
    it('should handle not found error (PGRST116)', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
          })
        })
      });
      const result = await service.deleteFlashcard('f1', 'u1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
    it('should handle supabase error on fetch', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: { code: 'OTHER' } })
          })
        })
      });
      const result = await service.deleteFlashcard('f1', 'u1');
      expect(result.success).toBe(false);
    });
    it('should handle supabase error on delete', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: { flashcard_id: 'f1', user_id: 'u1' }, error: null })
          })
        })
      });
      supabase.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({ error: 'err' })
        })
      });
      const result = await service.deleteFlashcard('f1', 'u1');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.deleteFlashcard('f1', 'u1');
      expect(result.success).toBe(false);
    });
  });

  describe('getFlashcardsDueForReview', () => {
    it('should return due flashcards', async () => {
      const mockData = [{ flashcard_id: 'f1' }];
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            lte: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });
      const result = await service.getFlashcardsDueForReview('u1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            lte: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({ data: null, error: 'err' })
            })
          })
        })
      });
      const result = await service.getFlashcardsDueForReview('u1');
      expect(result.success).toBe(false);
    });
    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });
      const result = await service.getFlashcardsDueForReview('u1');
      expect(result.success).toBe(false);
    });
  });
}); 