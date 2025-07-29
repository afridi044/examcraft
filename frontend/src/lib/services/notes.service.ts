// Notes Service - Backend API calls
import { apiClient } from '../api-client';
import type { 
  ApiResponse, 
  StudyNote
} from '@/types';

export const notesService = {
  /**
   * Get user's study notes
   */
  async getUserNotes(): Promise<ApiResponse<StudyNote[]>> {
    return apiClient.get<StudyNote[]>('/notes/user');
  },

  /**
   * Get note by ID
   */
  async getNoteById(noteId: string): Promise<ApiResponse<StudyNote>> {
    return apiClient.get<StudyNote>(`/notes/${noteId}`);
  },

  /**
   * Create a new study note
   */
  async createNote(input: {
    title: string;
    content: string;
    topic?: string;
  }): Promise<ApiResponse<StudyNote>> {
    return apiClient.post<StudyNote>('/notes', input);
  },

  /**
   * Update a study note
   */
  async updateNote(noteId: string, input: {
    title?: string;
    content?: string;
    topic?: string;
  }): Promise<ApiResponse<StudyNote>> {
    return apiClient.patch<StudyNote>(`/notes/${noteId}`, input);
  },

  /**
   * Delete a study note
   */
  async deleteNote(noteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/notes/${noteId}`);
  },
}; 