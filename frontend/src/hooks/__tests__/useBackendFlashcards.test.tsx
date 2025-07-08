import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
    useUserFlashcards,
    useDueFlashcards,
    useFlashcardExists,
    useFlashcardsExistBatch,
    useCreateFlashcard,
    useGenerateAIFlashcards,
    useCreateFromQuestion,
    useStartStudySession,
    useUpdateProgress,
    useUpdateFlashcard,
    useDeleteFlashcard,
    useInvalidateFlashcards,
    FLASHCARD_QUERY_KEYS,
} from '../useBackendFlashcards';
import { flashcardService } from '@/lib/services/flashcard.service';

// Mock the flashcard service
jest.mock('@/lib/services/flashcard.service', () => ({
    flashcardService: {
        getUserFlashcards: jest.fn(),
        getDueFlashcards: jest.fn(),
        checkFlashcardExists: jest.fn(),
        checkFlashcardsExistBatch: jest.fn(),
        createFlashcard: jest.fn(),
        generateAIFlashcards: jest.fn(),
        createFromQuestion: jest.fn(),
        startStudySession: jest.fn(),
        updateProgress: jest.fn(),
        updateFlashcard: jest.fn(),
        deleteFlashcard: jest.fn(),
    },
}));

const mockedFlashcardService = flashcardService as jest.Mocked<typeof flashcardService>;

// Create a wrapper for React Query
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useBackendFlashcards Hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =============================================
    // Query Hooks Tests
    // =============================================

    describe('useUserFlashcards', () => {
        it('fetches user flashcards successfully', async () => {
            const mockFlashcards = [
                { id: '1', question: 'What is React?', answer: 'A JavaScript library' },
                { id: '2', question: 'What is TypeScript?', answer: 'A typed JavaScript' },
            ];
            mockedFlashcardService.getUserFlashcards.mockResolvedValue({
                success: true,
                data: mockFlashcards,
                error: null,
            });

            const { result } = renderHook(() => useUserFlashcards(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual(mockFlashcards);
            expect(mockedFlashcardService.getUserFlashcards).toHaveBeenCalledTimes(1);
        });

        it('handles error response', async () => {
            mockedFlashcardService.getUserFlashcards.mockResolvedValue({
                success: false,
                data: null,
                error: 'Failed to fetch flashcards',
            });

            const { result } = renderHook(() => useUserFlashcards(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBeTruthy();
        });
    });

    describe('useDueFlashcards', () => {
        it('fetches due flashcards successfully', async () => {
            const mockDueFlashcards = [
                { id: '1', question: 'What is React?', answer: 'A JavaScript library', dueDate: '2024-01-01' },
            ];
            mockedFlashcardService.getDueFlashcards.mockResolvedValue({
                success: true,
                data: mockDueFlashcards,
                error: null,
            });

            const { result } = renderHook(() => useDueFlashcards(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual(mockDueFlashcards);
            expect(mockedFlashcardService.getDueFlashcards).toHaveBeenCalledTimes(1);
        });
    });

    describe('useFlashcardExists', () => {
        it('checks if flashcard exists successfully', async () => {
            const questionId = '123';
            mockedFlashcardService.checkFlashcardExists.mockResolvedValue({
                success: true,
                data: { exists: true },
                error: null,
            });

            const { result } = renderHook(() => useFlashcardExists(questionId), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual({ exists: true });
            expect(mockedFlashcardService.checkFlashcardExists).toHaveBeenCalledWith(questionId);
        });

        it('returns undefined when questionId is empty', async () => {
            const { result } = renderHook(() => useFlashcardExists(''), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toBeUndefined();
            expect(mockedFlashcardService.checkFlashcardExists).not.toHaveBeenCalled();
        });
    });

    describe('useFlashcardsExistBatch', () => {
        it('checks if flashcards exist for multiple questions', async () => {
            const questionIds = ['123', '456'];
            const mockResult = { '123': true, '456': false };
            mockedFlashcardService.checkFlashcardsExistBatch.mockResolvedValue({
                success: true,
                data: mockResult,
                error: null,
            });

            const { result } = renderHook(() => useFlashcardsExistBatch(questionIds), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual(mockResult);
            expect(mockedFlashcardService.checkFlashcardsExistBatch).toHaveBeenCalledWith({ questionIds });
        });

        it('returns undefined when questionIds is empty', async () => {
            const { result } = renderHook(() => useFlashcardsExistBatch([]), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toBeUndefined();
            expect(mockedFlashcardService.checkFlashcardsExistBatch).not.toHaveBeenCalled();
        });
    });

    // =============================================
    // Mutation Hooks Tests
    // =============================================

    describe('useCreateFlashcard', () => {
        it('creates flashcard successfully', async () => {
            const mockInput = { question: 'Test question', answer: 'Test answer' };
            const mockCreatedFlashcard = { id: '1', ...mockInput };
            mockedFlashcardService.createFlashcard.mockResolvedValue({
                success: true,
                data: mockCreatedFlashcard,
                error: null,
            });

            const { result } = renderHook(() => useCreateFlashcard(), { wrapper: createWrapper() });

            await act(async () => {
                const mutationResult = await result.current.mutateAsync(mockInput);
                expect(mutationResult).toEqual(mockCreatedFlashcard);
            });

            expect(mockedFlashcardService.createFlashcard).toHaveBeenCalledWith(mockInput);
        });

        it('handles creation error', async () => {
            const mockInput = { question: 'Test question', answer: 'Test answer' };
            mockedFlashcardService.createFlashcard.mockResolvedValue({
                success: false,
                data: null,
                error: 'Failed to create flashcard',
            });

            const { result } = renderHook(() => useCreateFlashcard(), { wrapper: createWrapper() });

            await act(async () => {
                try {
                    await result.current.mutateAsync(mockInput);
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                    expect((error as Error).message).toBe('Failed to create flashcard');
                }
            });
        });
    });

    describe('useGenerateAIFlashcards', () => {
        it('generates AI flashcards successfully', async () => {
            const mockInput = { topic: 'React', count: 5, difficulty: 'medium' as const };
            const mockGeneratedFlashcards = [
                { id: '1', question: 'What is React?', answer: 'A JavaScript library' },
                { id: '2', question: 'What are hooks?', answer: 'Functions that let you use state' },
            ];
            mockedFlashcardService.generateAIFlashcards.mockResolvedValue({
                success: true,
                data: mockGeneratedFlashcards,
                error: null,
            });

            const { result } = renderHook(() => useGenerateAIFlashcards(), { wrapper: createWrapper() });

            await act(async () => {
                const mutationResult = await result.current.mutateAsync(mockInput);
                expect(mutationResult).toEqual(mockGeneratedFlashcards);
            });

            expect(mockedFlashcardService.generateAIFlashcards).toHaveBeenCalledWith(mockInput);
        });
    });

    describe('useCreateFromQuestion', () => {
        it('creates flashcard from question successfully', async () => {
            const mockInput = { questionId: '123', topicId: '456' };
            const mockCreatedFlashcard = { id: '1', questionId: '123', topicId: '456' };
            mockedFlashcardService.createFromQuestion.mockResolvedValue({
                success: true,
                data: mockCreatedFlashcard,
                error: null,
            });

            const { result } = renderHook(() => useCreateFromQuestion(), { wrapper: createWrapper() });

            await act(async () => {
                const mutationResult = await result.current.mutateAsync(mockInput);
                expect(mutationResult).toEqual(mockCreatedFlashcard);
            });

            expect(mockedFlashcardService.createFromQuestion).toHaveBeenCalledWith(mockInput);
        });
    });

    describe('useStartStudySession', () => {
        it('starts study session successfully', async () => {
            const mockInput = { topicId: '123', sessionType: 'learning' as const };
            const mockSession = { sessionId: '1', flashcards: [] };
            mockedFlashcardService.startStudySession.mockResolvedValue({
                success: true,
                data: mockSession,
                error: null,
            });

            const { result } = renderHook(() => useStartStudySession(), { wrapper: createWrapper() });

            await act(async () => {
                const mutationResult = await result.current.mutateAsync(mockInput);
                expect(mutationResult).toEqual(mockSession);
            });

            expect(mockedFlashcardService.startStudySession).toHaveBeenCalledWith(mockInput);
        });
    });

    describe('useUpdateProgress', () => {
        it('updates progress successfully', async () => {
            const mockInput = { flashcardId: '123', quality: 5, timeSpent: 30 };
            const mockUpdatedProgress = { flashcardId: '123', nextReview: '2024-01-02' };
            mockedFlashcardService.updateProgress.mockResolvedValue({
                success: true,
                data: mockUpdatedProgress,
                error: null,
            });

            const { result } = renderHook(() => useUpdateProgress(), { wrapper: createWrapper() });

            await act(async () => {
                const mutationResult = await result.current.mutateAsync(mockInput);
                expect(mutationResult).toEqual(mockUpdatedProgress);
            });

            expect(mockedFlashcardService.updateProgress).toHaveBeenCalledWith(mockInput);
        });
    });

    describe('useUpdateFlashcard', () => {
        it('updates flashcard successfully', async () => {
            const flashcardId = '123';
            const mockInput = { question: 'Updated question', answer: 'Updated answer' };
            const mockUpdatedFlashcard = { id: flashcardId, ...mockInput };
            mockedFlashcardService.updateFlashcard.mockResolvedValue({
                success: true,
                data: mockUpdatedFlashcard,
                error: null,
            });

            const { result } = renderHook(() => useUpdateFlashcard(), { wrapper: createWrapper() });

            await act(async () => {
                const mutationResult = await result.current.mutateAsync({ flashcardId, input: mockInput });
                expect(mutationResult).toEqual(mockUpdatedFlashcard);
            });

            expect(mockedFlashcardService.updateFlashcard).toHaveBeenCalledWith(flashcardId, mockInput);
        });
    });

    describe('useDeleteFlashcard', () => {
        it('deletes flashcard successfully', async () => {
            const flashcardId = '123';
            const mockDeletedFlashcard = { id: flashcardId, deleted: true };
            mockedFlashcardService.deleteFlashcard.mockResolvedValue({
                success: true,
                data: mockDeletedFlashcard,
                error: null,
            });

            const { result } = renderHook(() => useDeleteFlashcard(), { wrapper: createWrapper() });

            await act(async () => {
                const mutationResult = await result.current.mutateAsync(flashcardId);
                expect(mutationResult).toEqual(mockDeletedFlashcard);
            });

            expect(mockedFlashcardService.deleteFlashcard).toHaveBeenCalledWith(flashcardId);
        });
    });

    // =============================================
    // Utility Hooks Tests
    // =============================================

    describe('useInvalidateFlashcards', () => {
        it('returns a function that can be called', () => {
            const { result } = renderHook(() => useInvalidateFlashcards(), { wrapper: createWrapper() });

            expect(typeof result.current).toBe('function');
        });

        it('can be called with options', () => {
            const { result } = renderHook(() => useInvalidateFlashcards(), { wrapper: createWrapper() });

            // Should not throw when called with options
            expect(() => result.current({ includeExistence: true, questionId: '123' })).not.toThrow();
        });
    });
}); 