// Backend-Powered Notes Hooks
// These replace direct frontend API calls with backend service calls

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { notesService } from "@/lib/services";
import type { StudyNote } from "@/types";

// =============================================
// Backend Notes Query Keys
// =============================================

export const BACKEND_NOTES_KEYS = {
  userNotes: () => ["backend", "notes", "user"] as const,
  note: (id: string) => ["backend", "notes", id] as const,
} as const;

// =============================================
// Backend Notes Hooks
// =============================================

/**
 * Get user's study notes using backend service - SECURE VERSION
 * Uses JWT token authentication, no userId parameter needed
 */
export function useBackendNotes() {
  return useQuery({
    queryKey: BACKEND_NOTES_KEYS.userNotes(),
    queryFn: () => notesService.getUserNotes(),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    refetchInterval: false,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Get note by ID using backend service
 */
export function useBackendNote(noteId: string) {
  return useQuery({
    queryKey: BACKEND_NOTES_KEYS.note(noteId),
    queryFn: () => notesService.getNoteById(noteId),
    select: (response) => response.data,
    enabled: !!noteId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Create a new study note using backend service
 */
export function useCreateBackendNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      topic?: string;
    }) => {
      const response = await notesService.createNote(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create note');
      }
      return response.data;
    },
    onSuccess: (_data) => {
      // Invalidate user notes
      queryClient.invalidateQueries({
        queryKey: BACKEND_NOTES_KEYS.userNotes(),
      });
    },
  });
}

/**
 * Update a study note using backend service
 */
export function useUpdateBackendNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, data }: {
      noteId: string;
      data: {
        title?: string;
        content?: string;
        topic?: string;
      };
    }) => {
      const response = await notesService.updateNote(noteId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update note');
      }
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate user notes and specific note
      queryClient.invalidateQueries({
        queryKey: BACKEND_NOTES_KEYS.userNotes(),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_NOTES_KEYS.note(variables.noteId),
      });
    },
  });
}

/**
 * Delete a study note using backend service
 */
export function useDeleteBackendNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const response = await notesService.deleteNote(noteId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete note');
      }
      return response.data;
    },
    onSuccess: (_data, noteId) => {
      // Invalidate user notes and specific note
      queryClient.invalidateQueries({
        queryKey: BACKEND_NOTES_KEYS.userNotes(),
      });
      queryClient.invalidateQueries({
        queryKey: BACKEND_NOTES_KEYS.note(noteId),
      });
    },
  });
}

// =============================================
// Backend Notes Cache Management
// =============================================

export function useInvalidateBackendNotes() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    // Invalidate all notes queries
    queryClient.invalidateQueries({
      queryKey: ["backend", "notes"],
    });
  }, [queryClient]);
} 