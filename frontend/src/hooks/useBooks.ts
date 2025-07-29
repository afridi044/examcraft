// Books Hooks - Mock Data
import { useQuery } from "@tanstack/react-query";
import { booksService } from "@/lib/services/books.service";
import type { Book } from "@/types";

// =============================================
// Books Query Keys
// =============================================

export const BOOKS_KEYS = {
  all: () => ["books"] as const,
  book: (id: string) => ["books", id] as const,
  search: (query: string) => ["books", "search", query] as const,
  subject: (subject: string) => ["books", "subject", subject] as const,
} as const;

// =============================================
// Books Hooks
// =============================================

/**
 * Get all books using mock data
 */
export function useBooks() {
  return useQuery({
    queryKey: BOOKS_KEYS.all(),
    queryFn: () => booksService.getBooks(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    refetchInterval: false,
  });
}

/**
 * Get book by ID using mock data
 */
export function useBook(bookId: string) {
  return useQuery({
    queryKey: BOOKS_KEYS.book(bookId),
    queryFn: () => booksService.getBookById(bookId),
    enabled: !!bookId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Search books using mock data
 */
export function useSearchBooks(query: string) {
  return useQuery({
    queryKey: BOOKS_KEYS.search(query),
    queryFn: () => booksService.searchBooks(query),
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get books by subject using mock data
 */
export function useBooksBySubject(subject: string) {
  return useQuery({
    queryKey: BOOKS_KEYS.subject(subject),
    queryFn: () => booksService.getBooksBySubject(subject),
    enabled: !!subject,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
} 