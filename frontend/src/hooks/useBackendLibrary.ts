// Backend-Powered Library Hooks
// These replace direct frontend API calls with backend service calls

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { libraryService } from "@/lib/services";

// =============================================
// Backend Library Query Keys
// =============================================

export const BACKEND_LIBRARY_KEYS = {
  userNotes: () => ["backend", "library", "notes"] as const,
} as const;

// =============================================
// Backend Library Hooks
// =============================================

/**
 * Get user's notes for library
 */
export function useBackendLibraryNotes() {
  return useQuery({
    queryKey: BACKEND_LIBRARY_KEYS.userNotes(),
    queryFn: () => libraryService.getUserNotes(),
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



// =============================================
// Backend Library Cache Management
// =============================================

export function useInvalidateBackendLibrary() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    // Invalidate all library queries
    queryClient.invalidateQueries({
      queryKey: ["backend", "library"],
    });
  }, [queryClient]);
} 