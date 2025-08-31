import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  StudyNoteRow,
  CreateStudyNoteInput,
  UpdateStudyNoteInput,
} from '../../types/shared.types';

@Injectable()
export class NotesDatabaseService extends BaseDatabaseService {
  
  async getUserNotes(userId: string): Promise<ApiResponse<StudyNoteRow[]>> {
    try {
      this.logger.log(`📝 Getting notes for user: ${userId}`);

      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.STUDY_NOTES)
        .select(`
          *,
          topics(name)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        this.logger.error('❌ Error fetching user notes:', error);
        return this.handleError(error, 'getUserNotes');
      }

      this.logger.log(`✅ Retrieved ${data?.length || 0} notes for user`);
      return this.handleSuccess(data || []);
    } catch (error) {
      return this.handleError(error, 'getUserNotes');
    }
  }

  async getNoteById(noteId: string, userId: string): Promise<ApiResponse<StudyNoteRow>> {
    try {
      this.logger.log(`🔍 Getting note: ${noteId} for user: ${userId}`);

      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.STUDY_NOTES)
        .select(`
          *,
          topics(name)
        `)
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .single();

      if (error) {
        this.logger.error('❌ Error fetching note:', error);
        return this.handleError(error, 'getNoteById');
      }

      this.logger.log(`✅ Retrieved note: ${noteId}`);
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getNoteById');
    }
  }

  async createNote(input: CreateStudyNoteInput): Promise<ApiResponse<StudyNoteRow>> {
    try {
      this.logger.log(`✨ Creating note: ${input.title} for user: ${input.user_id}`);

      // Calculate word count
      const wordCount = input.content.split(/\s+/).filter(word => word.length > 0).length;

      const noteData = {
        user_id: input.user_id,
        title: input.title,
        content: input.content,
        note_type: input.note_type || 'lecture_notes',
        topic_id: input.topic_id || null,
        tags: input.tags || [],
        word_count: wordCount,
        is_public: input.is_public || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.STUDY_NOTES)
        .insert(noteData)
        .select()
        .single();

      if (error) {
        this.logger.error('❌ Error creating note:', error);
        return this.handleError(error, 'createNote');
      }

      this.logger.log(`✅ Created note: ${data.note_id}`);
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createNote');
    }
  }

  async updateNote(noteId: string, input: UpdateStudyNoteInput, userId: string): Promise<ApiResponse<StudyNoteRow>> {
    try {
      this.logger.log(`✏️ Updating note: ${noteId} for user: ${userId}`);

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (input.title !== undefined) updateData.title = input.title;
      if (input.content !== undefined) {
        updateData.content = input.content;
        // Recalculate word count
        updateData.word_count = input.content.split(/\s+/).filter(word => word.length > 0).length;
      }
      if (input.note_type !== undefined) updateData.note_type = input.note_type;
      if (input.topic_id !== undefined) updateData.topic_id = input.topic_id;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.is_public !== undefined) updateData.is_public = input.is_public;

      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.STUDY_NOTES)
        .update(updateData)
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        this.logger.error('❌ Error updating note:', error);
        return this.handleError(error, 'updateNote');
      }

      if (!data) {
        return this.handleError(new Error('Note not found or access denied'), 'updateNote');
      }

      this.logger.log(`✅ Updated note: ${noteId}`);
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateNote');
    }
  }

  async deleteNote(noteId: string, userId: string): Promise<ApiResponse<null>> {
    try {
      this.logger.log(`🗑️ Deleting note: ${noteId} for user: ${userId}`);

      const { error } = await this.supabaseAdmin
        .from(TABLE_NAMES.STUDY_NOTES)
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', userId);

      if (error) {
        this.logger.error('❌ Error deleting note:', error);
        return this.handleError(error, 'deleteNote');
      }

      this.logger.log(`✅ Deleted note: ${noteId}`);
      return this.handleSuccess(null);
    } catch (error) {
      return this.handleError(error, 'deleteNote');
    }
  }
} 