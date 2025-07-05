import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../types/shared.types';

@Injectable()
export class ExamDatabaseService extends BaseDatabaseService {
  
  async createExam(
    input: TablesInsert<'exams'>,
    questionIds: string[] = [],
  ): Promise<ApiResponse<Tables<'exams'>>> {
    try {
      this.logger.log(`📝 Creating exam: ${input.title}`);

      // Start transaction
      const { data: exam, error: examError } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXAMS)
        .insert(input)
        .select()
        .single();

      if (examError) return this.handleError(examError, 'createExam - exam');

      // Add questions to exam if provided
      if (questionIds.length > 0) {
        const examQuestions = questionIds.map((questionId, index) => ({
          exam_id: exam.exam_id,
          question_id: questionId,
          question_order: index + 1,
          points: 1, // Default points per question
        }));

        const { error: questionsError } = await this.supabaseAdmin
          .from('exam_questions')
          .insert(examQuestions);

        if (questionsError) {
          // Rollback: delete the exam
          await this.supabaseAdmin
            .from(TABLE_NAMES.EXAMS)
            .delete()
            .eq('exam_id', exam.exam_id);
          return this.handleError(questionsError, 'createExam - questions');
        }
      }

      this.logger.log(
        `✅ Created exam ${exam.exam_id} with ${questionIds.length} questions`,
      );
      return this.handleSuccess(exam);
    } catch (error) {
      return this.handleError(error, 'createExam');
    }
  }

  async getExamById(examId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`🔍 Getting exam: ${examId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.EXAMS)
        .select(
          `
          *,
          topic:topics(*),
          exam_questions!inner(
            question_order,
            points,
            questions(
              *,
              question_options(*),
              explanations(content)
            )
          )
        `,
        )
        .eq('exam_id', examId)
        .single();

      if (error) return this.handleError(error, 'getExamById');

      // Transform the data to a more usable format
      const { exam_questions, ...examData } = data;
      const transformedExam = {
        ...examData,
        questions: exam_questions
          ?.map((eq: any) => ({
            question_id: eq.questions.question_id,
            question_order: eq.question_order,
            points: eq.points,
            question: eq.questions,
          }))
          .sort((a: any, b: any) => a.question_order - b.question_order),
        total_questions: exam_questions?.length || 0,
        total_points:
          exam_questions?.reduce(
            (sum: number, eq: any) => sum + eq.points,
            0,
          ) || 0,
      };

      return this.handleSuccess(transformedExam);
    } catch (error) {
      return this.handleError(error, 'getExamById');
    }
  }

  async getUserExams(userId: string): Promise<ApiResponse<any[]>> {
    try {
      this.logger.log(`📚 Getting exams for user: ${userId}`);

      const { data, error } = await this.supabase
        .from(TABLE_NAMES.EXAMS)
        .select(
          `
          *,
          topic:topics(topic_id, name),
          exam_questions(points)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return this.handleError(error, 'getUserExams');

      // Transform data to include calculated fields
      const transformedExams = (data || []).map((exam) => ({
        ...exam,
        total_questions: exam.exam_questions?.length || 0,
        total_points:
          exam.exam_questions?.reduce(
            (sum, eq) => sum + (eq.points || 1),
            0,
          ) || 0,
        exam_questions: undefined, // Remove from response
      }));

      return this.handleSuccess(transformedExams);
    } catch (error) {
      return this.handleError(error, 'getUserExams');
    }
  }

  async updateExam(
    examId: string,
    input: TablesUpdate<'exams'>,
    questionIds?: string[],
  ): Promise<ApiResponse<Tables<'exams'>>> {
    try {
      this.logger.log(`📝 Updating exam: ${examId}`);

      // Update exam
      const { data: exam, error: examError } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXAMS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('exam_id', examId)
        .select()
        .single();

      if (examError) return this.handleError(examError, 'updateExam - exam');

      // Update questions if provided
      if (questionIds) {
        // Delete existing question associations
        const { error: deleteError } = await this.supabaseAdmin
          .from('exam_questions')
          .delete()
          .eq('exam_id', examId);

        if (deleteError)
          return this.handleError(deleteError, 'updateExam - delete questions');

        // Add new question associations
        if (questionIds.length > 0) {
          const examQuestions = questionIds.map((questionId, index) => ({
            exam_id: examId,
            question_id: questionId,
            question_order: index + 1,
            points: 1,
          }));

          const { error: insertError } = await this.supabaseAdmin
            .from('exam_questions')
            .insert(examQuestions);

          if (insertError)
            return this.handleError(insertError, 'updateExam - insert questions');
        }
      }

      return this.handleSuccess(exam);
    } catch (error) {
      return this.handleError(error, 'updateExam');
    }
  }

  async deleteExam(examId: string): Promise<ApiResponse<boolean>> {
    try {
      this.logger.log(`🗑️ Deleting exam: ${examId}`);

      // Get exam questions first for cleanup
      const { data: examQuestions } = await this.supabase
        .from('exam_questions')
        .select('question_id')
        .eq('exam_id', examId);

      const questionIds = examQuestions?.map((eq) => eq.question_id) || [];

      // Delete exam (cascades to exam_questions and exam_sessions)
      const { error: examError } = await this.supabaseAdmin
        .from(TABLE_NAMES.EXAMS)
        .delete()
        .eq('exam_id', examId);

      if (examError) return this.handleError(examError, 'deleteExam');

      this.logger.log(
        `✅ Successfully deleted exam ${examId} with ${questionIds.length} questions`,
      );
      return this.handleSuccess(true);
    } catch (error) {
      return this.handleError(error, 'deleteExam');
    }
  }

  async getExamSessions(
    userId: string,
    examId?: string,
  ): Promise<ApiResponse<any[]>> {
    try {
      this.logger.log(
        `📊 Getting exam sessions for user: ${userId}${examId ? `, exam: ${examId}` : ''}`,
      );

      let query = this.supabase
        .from('exam_sessions')
        .select(
          `
          *,
          exam:exams(title, duration_minutes, passing_score),
          exam_analytics(*)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (examId) {
        query = query.eq('exam_id', examId);
      }

      const { data, error } = await query;

      if (error) return this.handleError(error, 'getExamSessions');
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getExamSessions');
    }
  }

  async createExamSession(
    input: TablesInsert<'exam_sessions'>,
  ): Promise<ApiResponse<Tables<'exam_sessions'>>> {
    try {
      this.logger.log(`🚀 Starting exam session for exam: ${input.exam_id}`);

      const { data, error } = await this.supabaseAdmin
        .from('exam_sessions')
        .insert(input)
        .select()
        .single();

      if (error) return this.handleError(error, 'createExamSession');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createExamSession');
    }
  }

  async updateExamSession(
    sessionId: string,
    input: TablesUpdate<'exam_sessions'>,
  ): Promise<ApiResponse<Tables<'exam_sessions'>>> {
    try {
      this.logger.log(`📊 Updating exam session: ${sessionId}`);

      const { data, error } = await this.supabaseAdmin
        .from('exam_sessions')
        .update(input)
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) return this.handleError(error, 'updateExamSession');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateExamSession');
    }
  }

  async getExamSessionById(
    sessionId: string,
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.log(`🔍 Getting exam session: ${sessionId}`);

      const { data, error } = await this.supabase
        .from('exam_sessions')
        .select(
          `
          *,
          exam:exams(*),
          exam_analytics(*)
        `,
        )
        .eq('session_id', sessionId)
        .single();

      if (error) return this.handleError(error, 'getExamSessionById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getExamSessionById');
    }
  }
}
