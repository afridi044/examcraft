import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import {
  ApiResponse,
  CreateStudyNoteInput,
  UpdateStudyNoteInput,
  StudyNoteRow,
} from '../types/shared.types';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getUserNotes(userId: string): Promise<ApiResponse<StudyNoteRow[]>> {
    this.logger.log(`📝 Getting notes for user: ${userId}`);
    return await this.databaseService.getUserNotes(userId);
  }

  async getNoteById(noteId: string, userId: string): Promise<ApiResponse<StudyNoteRow>> {
    this.logger.log(`🔍 Getting note: ${noteId} for user: ${userId}`);
    const result = await this.databaseService.getNoteById(noteId, userId);
    
    if (!result.success || !result.data) {
      throw new NotFoundException('Note not found');
    }
    
    return result;
  }

  async createNote(createNoteDto: CreateNoteDto, userId: string): Promise<ApiResponse<StudyNoteRow>> {
    this.logger.log(`✨ Creating note: ${createNoteDto.title} for user: ${userId}`);

    const noteInput: CreateStudyNoteInput = {
      user_id: userId,
      title: createNoteDto.title,
      content: createNoteDto.content,
      topic_id: createNoteDto.topic ? createNoteDto.topic : null,
    };

    return await this.databaseService.createNote(noteInput);
  }

  async updateNote(noteId: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<ApiResponse<StudyNoteRow>> {
    this.logger.log(`✏️ Updating note: ${noteId} for user: ${userId}`);

    const updateInput: UpdateStudyNoteInput = {
      title: updateNoteDto.title,
      content: updateNoteDto.content,
      topic_id: updateNoteDto.topic || null,
    };

    const result = await this.databaseService.updateNote(noteId, updateInput, userId);
    
    if (!result.success) {
      throw new NotFoundException('Note not found or access denied');
    }
    
    return result;
  }

  async deleteNote(noteId: string, userId: string): Promise<ApiResponse<null>> {
    this.logger.log(`🗑️ Deleting note: ${noteId} for user: ${userId}`);
    
    const result = await this.databaseService.deleteNote(noteId, userId);
    
    if (!result.success) {
      throw new NotFoundException('Note not found or access denied');
    }
    
    return result;
  }
} 