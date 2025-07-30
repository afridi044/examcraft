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

    let topicId: string | null = null;

    // Handle topic and subtopic logic (same as quiz service)
    if (createNoteDto.topic_id) {
      // Handle subtopic logic
      if (createNoteDto.subtopic_name && createNoteDto.topic_id) {
        // Check if subtopic already exists under the parent topic
        const existingSubtopicRes = await this.databaseService.findSubtopicByNameAndParent(
          createNoteDto.subtopic_name,
          createNoteDto.topic_id
        );

        if (!existingSubtopicRes.success) {
          throw new Error(existingSubtopicRes.error || 'Failed to check for existing subtopic');
        }

        if (existingSubtopicRes.data) {
          // Subtopic exists, use it
          topicId = existingSubtopicRes.data.topic_id;
          this.logger.log(`📝 Using existing subtopic: ${createNoteDto.subtopic_name}`);
        } else {
          // Create new subtopic under the parent topic
          const subtopicRes = await this.databaseService.createSubtopic(
            createNoteDto.subtopic_name,
            createNoteDto.topic_id
          );

          if (!subtopicRes.success || !subtopicRes.data) {
            throw new Error(subtopicRes.error || 'Failed to create subtopic');
          }

          topicId = subtopicRes.data.topic_id;
          this.logger.log(`✨ Created new subtopic: ${createNoteDto.subtopic_name} under parent topic`);
        }
      } else {
        // Using existing topic without subtopic
        topicId = createNoteDto.topic_id;
      }
    } else {
      throw new Error('topic_id is required');
    }

    const noteInput: CreateStudyNoteInput = {
      user_id: userId,
      title: createNoteDto.title,
      content: createNoteDto.content,
      topic_id: topicId,
    };

    return await this.databaseService.createNote(noteInput);
  }

  async updateNote(noteId: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<ApiResponse<StudyNoteRow>> {
    this.logger.log(`✏️ Updating note: ${noteId} for user: ${userId}`);

    let topicId: string | null = null;

    // Handle topic mapping: convert topic name to topic_id
    if (updateNoteDto.topic) {
      try {
        // First, try to find existing topic by name
        const topicsResponse = await this.databaseService.getAllTopics();
        if (topicsResponse.success && topicsResponse.data) {
          const existingTopic = topicsResponse.data.find(
            (topic: any) => topic.name.toLowerCase() === updateNoteDto.topic!.toLowerCase()
          );
          
          if (existingTopic) {
            topicId = existingTopic.topic_id;
            this.logger.log(`📝 Found existing topic: ${updateNoteDto.topic} -> ${topicId}`);
          } else {
            // Create new topic if it doesn't exist
            const newTopicResponse = await this.databaseService.createTopic({
              name: updateNoteDto.topic,
              description: null,
              parent_topic_id: null,
            });
            
            if (newTopicResponse.success && newTopicResponse.data) {
              topicId = newTopicResponse.data.topic_id;
              this.logger.log(`✨ Created new topic: ${updateNoteDto.topic} -> ${topicId}`);
            }
          }
        }
      } catch (error) {
        this.logger.error(`❌ Error handling topic mapping: ${error}`);
        // Continue without topic if there's an error
      }
    }

    const updateInput: UpdateStudyNoteInput = {
      title: updateNoteDto.title,
      content: updateNoteDto.content,
      topic_id: topicId,
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