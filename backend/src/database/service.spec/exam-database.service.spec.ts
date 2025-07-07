import { ExamDatabaseService } from '../services/exam-database.service';
import { TABLE_NAMES } from '../../types/shared.types';

describe('ExamDatabaseService', () => {
  let service: ExamDatabaseService;
  let supabase: any;
  let supabaseAdmin: any;
  let mockLogger: any;
  let mockConfigService: any;

  beforeEach(() => {
    supabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };
    supabaseAdmin = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    mockConfigService = { get: jest.fn() };
    service = new ExamDatabaseService(mockConfigService as any);
    (service as any).supabase = supabase;
    (service as any).supabaseAdmin = supabaseAdmin;
    (service as any).logger = mockLogger;
  });

  describe('createExam', () => {
    it('should create exam successfully without questions', async () => {
      const input = { title: 'Test Exam', user_id: 'u1' };
      const mockData = { exam_id: 'e1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });

      const result = await service.createExam(input as any);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockLogger.log).toHaveBeenCalledWith(`📝 Creating exam: ${input.title}`);
    });

    it('should create exam successfully with questions', async () => {
      const input = { title: 'Test Exam', user_id: 'u1' };
      const questionIds = ['q1', 'q2'];
      const mockData = { exam_id: 'e1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ error: null })
      });

      const result = await service.createExam(input as any, questionIds);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockLogger.log).toHaveBeenCalledWith(`✅ Created exam ${mockData.exam_id} with ${questionIds.length} questions`);
    });

    it('should handle exam creation error', async () => {
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: 'Exam creation failed' })
          })
        })
      });

      const result = await service.createExam({} as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle questions insertion error and rollback', async () => {
      const input = { title: 'Test Exam', user_id: 'u1' };
      const questionIds = ['q1'];
      const mockData = { exam_id: 'e1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ error: 'Questions insertion failed' })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({ error: null })
        })
      });

      const result = await service.createExam(input as any, questionIds);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabaseAdmin.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.createExam({} as any);
      
      expect(result.success).toBe(false);
    });
  });

  describe('getExamById', () => {
    it('should get exam by id successfully', async () => {
      const mockData = {
        exam_id: 'e1',
        title: 'Test Exam',
        exam_questions: [
          {
            question_order: 1,
            points: 2,
            questions: {
              question_id: 'q1',
              content: 'Test question',
              question_options: [],
              explanations: { content: 'Explanation' }
            }
          }
        ]
      };
      
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });

      const result = await service.getExamById('e1');
      
      expect(result.success).toBe(true);
      expect(result.data.exam_id).toBe('e1');
      expect(result.data.questions).toHaveLength(1);
      expect(result.data.total_questions).toBe(1);
      expect(result.data.total_points).toBe(2);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: 'Exam not found' })
          })
        })
      });

      const result = await service.getExamById('e1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.getExamById('e1');
      
      expect(result.success).toBe(false);
    });
  });

  describe('getUserExams', () => {
    it('should get user exams successfully', async () => {
      const mockData = [
        {
          exam_id: 'e1',
          title: 'Test Exam',
          exam_questions: [{ points: 2 }, { points: 3 }]
        }
      ];
      
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });

      const result = await service.getUserExams('u1');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].total_questions).toBe(2);
      expect(result.data![0].total_points).toBe(5);
      expect(result.data![0].exam_questions).toBeUndefined();
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({ data: null, error: 'Database error' })
          })
        })
      });

      const result = await service.getUserExams('u1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.getUserExams('u1');
      
      expect(result.success).toBe(false);
    });
  });

  describe('updateExam', () => {
    it('should update exam successfully without questions', async () => {
      const input = { title: 'Updated Exam' };
      const mockData = { exam_id: 'e1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });

      const result = await service.updateExam('e1', input as any);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should update exam successfully with questions', async () => {
      const input = { title: 'Updated Exam' };
      const questionIds = ['q1', 'q2'];
      const mockData = { exam_id: 'e1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({ error: null })
        })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValueOnce({ error: null })
      });

      const result = await service.updateExam('e1', input as any, questionIds);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle exam update error', async () => {
      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: null, error: 'Update failed' })
            })
          })
        })
      });

      const result = await service.updateExam('e1', {} as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle questions deletion error', async () => {
      const input = { title: 'Updated Exam' };
      const questionIds = ['q1'];
      const mockData = { exam_id: 'e1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({ error: 'Delete failed' })
        })
      });

      const result = await service.updateExam('e1', input as any, questionIds);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabaseAdmin.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.updateExam('e1', {} as any);
      
      expect(result.success).toBe(false);
    });
  });

  describe('deleteExam', () => {
    it('should delete exam successfully', async () => {
      const mockQuestions = [{ question_id: 'q1' }, { question_id: 'q2' }];
      
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            data: mockQuestions,
            error: null
          })
        })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({ error: null })
        })
      });

      const result = await service.deleteExam('e1');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith(`✅ Successfully deleted exam e1 with ${mockQuestions.length} questions`);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            data: [],
            error: null
          })
        })
      });
      supabaseAdmin.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({ error: 'Delete failed' })
        })
      });

      const result = await service.deleteExam('e1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.deleteExam('e1');
      
      expect(result.success).toBe(false);
    });
  });

  describe('getExamSessions', () => {
    it('should get exam sessions for user successfully', async () => {
      const mockData = [{ session_id: 's1', exam: { title: 'Test Exam' } }];
      
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });

      const result = await service.getExamSessions('u1');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should get exam sessions for specific exam successfully', async () => {
      const mockData = [{ session_id: 's1', exam: { title: 'Test Exam' } }];
      
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockReturnValueOnce({
              eq: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });

      const result = await service.getExamSessions('u1', 'e1');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({ data: null, error: 'Database error' })
          })
        })
      });

      const result = await service.getExamSessions('u1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.getExamSessions('u1');
      
      expect(result.success).toBe(false);
    });
  });

  describe('createExamSession', () => {
    it('should create exam session successfully', async () => {
      const input = { exam_id: 'e1', user_id: 'u1' };
      const mockData = { session_id: 's1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });

      const result = await service.createExamSession(input as any);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockLogger.log).toHaveBeenCalledWith(`🚀 Starting exam session for exam: ${input.exam_id}`);
    });

    it('should handle supabase error', async () => {
      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: 'Session creation failed' })
          })
        })
      });

      const result = await service.createExamSession({} as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabaseAdmin.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.createExamSession({} as any);
      
      expect(result.success).toBe(false);
    });
  });

  describe('updateExamSession', () => {
    it('should update exam session successfully', async () => {
      const input = { status: 'completed' };
      const mockData = { session_id: 's1', ...input };
      
      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
            })
          })
        })
      });

      const result = await service.updateExamSession('s1', input as any);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockLogger.log).toHaveBeenCalledWith(`📊 Updating exam session: s1`);
    });

    it('should handle supabase error', async () => {
      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({ data: null, error: 'Update failed' })
            })
          })
        })
      });

      const result = await service.updateExamSession('s1', {} as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabaseAdmin.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.updateExamSession('s1', {} as any);
      
      expect(result.success).toBe(false);
    });
  });

  describe('getExamSessionById', () => {
    it('should get exam session by id successfully', async () => {
      const mockData = { session_id: 's1', exam: { title: 'Test Exam' } };
      
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: mockData, error: null })
          })
        })
      });

      const result = await service.getExamSessionById('s1');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockLogger.log).toHaveBeenCalledWith(`🔍 Getting exam session: s1`);
    });

    it('should handle supabase error', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({ data: null, error: 'Session not found' })
          })
        })
      });

      const result = await service.getExamSessionById('s1');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle thrown error', async () => {
      supabase.from.mockImplementation(() => { throw new Error('fail'); });

      const result = await service.getExamSessionById('s1');
      
      expect(result.success).toBe(false);
    });
  });
}); 