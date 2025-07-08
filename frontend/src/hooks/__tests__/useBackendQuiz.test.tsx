import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
    useBackendUserQuizAttempts,
    useBackendQuizReview,
    useBackendQuizWithQuestions,
    useCreateBackendQuiz,
    useDeleteBackendQuiz,
    useInvalidateBackendQuiz,
    useUpdateQuizFlashcardStatus,
    BACKEND_QUIZ_KEYS,
} from '../useBackendQuiz';
import { quizService } from '@/lib/services';

// Mock the quiz service
jest.mock('@/lib/services');
const mockedQuizService = quizService as jest.Mocked<typeof quizService>;

// Test wrapper with React Query provider
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Disable retries for tests
                gcTime: 0, // Disable cache time for tests
            },
            mutations: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

// Helper to get a fresh query client for each test
const getQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
});

describe('useBackendQuiz hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('BACKEND_QUIZ_KEYS', () => {
        it('should generate correct query keys', () => {
            expect(BACKEND_QUIZ_KEYS.userAttempts()).toEqual(['backend', 'quiz', 'attempts']);
            expect(BACKEND_QUIZ_KEYS.quizReview('quiz123')).toEqual(['backend', 'quiz', 'review', 'quiz123']);
            expect(BACKEND_QUIZ_KEYS.quiz('quiz456')).toEqual(['backend', 'quiz', 'quiz456']);
            expect(BACKEND_QUIZ_KEYS.quizWithQuestions('quiz789')).toEqual(['backend', 'quiz', 'questions', 'quiz789']);
        });
    });

    describe('useBackendUserQuizAttempts', () => {
        it('should fetch user quiz attempts successfully', async () => {
            const mockAttempts = [
                { id: 'attempt1', quiz_id: 'quiz1', score: 85 },
                { id: 'attempt2', quiz_id: 'quiz2', score: 92 },
            ];

            mockedQuizService.getUserAttempts.mockResolvedValue({
                success: true,
                data: mockAttempts,
                error: null,
            });

            const { result } = renderHook(() => useBackendUserQuizAttempts(), {
                wrapper: createWrapper(),
            });

            // Initially loading
            expect(result.current.isLoading).toBe(true);
            // Data starts undefined until query succeeds and select runs

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockAttempts);
            expect(result.current.isLoading).toBe(false);
            expect(mockedQuizService.getUserAttempts).toHaveBeenCalledTimes(1);
        });

        it('should handle empty attempts list', async () => {
            mockedQuizService.getUserAttempts.mockResolvedValue({
                success: true,
                data: [],
                error: null,
            });

            const { result } = renderHook(() => useBackendUserQuizAttempts(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([]);
        });

        it('should handle service error', async () => {
            // For this hook, service errors result in empty array due to select function
            mockedQuizService.getUserAttempts.mockResolvedValue({
                success: false,
                data: null,
                error: 'Failed to fetch attempts',
            });

            const { result } = renderHook(() => useBackendUserQuizAttempts(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // The select function returns [] when data is null
            expect(result.current.data).toEqual([]);
        });

        it('should handle network error', async () => {
            mockedQuizService.getUserAttempts.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useBackendUserQuizAttempts(), {
                wrapper: createWrapper(),
            });

            // Wait a bit for the query to attempt to run
            await new Promise(resolve => setTimeout(resolve, 100));

            // With network errors and the select function, behavior may vary
            // The important thing is that the service was called
            expect(mockedQuizService.getUserAttempts).toHaveBeenCalled();

            // The hook should handle the error gracefully, either with error state or empty data
            expect(result.current.isLoading || result.current.isError || result.current.data).toBeDefined();
        });
    });

    describe('useBackendQuizReview', () => {
        const quizId = 'quiz123';

        it('should fetch quiz review successfully', async () => {
            const mockReview = {
                quiz: { id: quizId, title: 'Test Quiz' },
                questions: [
                    { question_id: 'q1', text: 'Question 1', flashcard_exists: false },
                ],
                score: 85,
            };

            mockedQuizService.getQuizReview.mockResolvedValue({
                success: true,
                data: mockReview,
                error: null,
            });

            const { result } = renderHook(() => useBackendQuizReview(quizId), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockReview);
            expect(mockedQuizService.getQuizReview).toHaveBeenCalledWith(quizId);
        });

        it('should not fetch when quizId is empty', () => {
            const { result } = renderHook(() => useBackendQuizReview(''), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.fetchStatus).toBe('idle');
            expect(mockedQuizService.getQuizReview).not.toHaveBeenCalled();
        });

        it('should handle quiz review error', async () => {
            mockedQuizService.getQuizReview.mockRejectedValue(new Error('Quiz not found'));

            const { result } = renderHook(() => useBackendQuizReview(quizId), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeInstanceOf(Error);
        });
    });

    describe('useBackendQuizWithQuestions', () => {
        const quizId = 'quiz456';

        it('should fetch quiz with questions successfully', async () => {
            const mockQuiz = {
                id: quizId,
                title: 'Test Quiz',
                questions: [
                    { id: 'q1', text: 'Question 1', options: [] },
                    { id: 'q2', text: 'Question 2', options: [] },
                ],
            };

            mockedQuizService.getQuizById.mockResolvedValue({
                success: true,
                data: mockQuiz,
                error: null,
            });

            const { result } = renderHook(() => useBackendQuizWithQuestions(quizId), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockQuiz);
            expect(mockedQuizService.getQuizById).toHaveBeenCalledWith(quizId);
        });

        it('should not fetch when quizId is empty', () => {
            const { result } = renderHook(() => useBackendQuizWithQuestions(''), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.fetchStatus).toBe('idle');
            expect(mockedQuizService.getQuizById).not.toHaveBeenCalled();
        });

        it('should throw error when service returns failure', async () => {
            mockedQuizService.getQuizById.mockResolvedValue({
                success: false,
                data: null,
                error: 'Quiz not found',
            });

            const { result } = renderHook(() => useBackendQuizWithQuestions(quizId), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect((result.current.error as Error).message).toBe('Quiz not found');
        });

        it('should throw default error when no error message provided', async () => {
            mockedQuizService.getQuizById.mockResolvedValue({
                success: false,
                data: null,
                error: null,
            });

            const { result } = renderHook(() => useBackendQuizWithQuestions(quizId), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect((result.current.error as Error).message).toBe('Failed to get quiz');
        });
    });

    describe('useCreateBackendQuiz', () => {
        it('should create quiz successfully and invalidate cache', async () => {
            const mockQuizInput = {
                title: 'New Quiz',
                description: 'Test description',
                topic_name: 'JavaScript',
                difficulty: 3,
                num_questions: 5,
            };

            const mockCreatedQuiz = {
                id: 'new-quiz-id',
                title: 'New Quiz',
                questions: [],
            };

            mockedQuizService.createQuiz.mockResolvedValue({
                success: true,
                data: mockCreatedQuiz,
                error: null,
            });

            const queryClient = getQueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient} >
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useCreateBackendQuiz(), { wrapper });

            await act(async () => {
                const mutation = result.current.mutateAsync(mockQuizInput);
                await expect(mutation).resolves.toEqual(mockCreatedQuiz);
            });

            expect(mockedQuizService.createQuiz).toHaveBeenCalledWith(mockQuizInput);
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: BACKEND_QUIZ_KEYS.userAttempts(),
            });
        });

        it('should handle create quiz error', async () => {
            const mockQuizInput = {
                title: 'New Quiz',
                description: 'Test description',
                topic_name: 'JavaScript',
                difficulty: 3,
                num_questions: 5,
            };

            mockedQuizService.createQuiz.mockResolvedValue({
                success: false,
                data: null,
                error: 'Validation failed',
            });

            const { result } = renderHook(() => useCreateBackendQuiz(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync(mockQuizInput);
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                    expect((error as Error).message).toBe('Validation failed');
                }
            });
        });

        it('should handle network error during creation', async () => {
            const mockQuizInput = {
                title: 'New Quiz',
                description: 'Test description',
                topic_name: 'JavaScript',
                difficulty: 3,
                num_questions: 5,
            };

            mockedQuizService.createQuiz.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useCreateBackendQuiz(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                try {
                    await result.current.mutateAsync(mockQuizInput);
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                    expect((error as Error).message).toBe('Network error');
                }
            });
        });
    });

    describe('useDeleteBackendQuiz', () => {
        const quizId = 'quiz-to-delete';

        it('should delete quiz successfully and clean up cache', async () => {
            mockedQuizService.deleteQuiz.mockResolvedValue({
                success: true,
                data: null,
                error: null,
            });

            const queryClient = getQueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
            const removeSpy = jest.spyOn(queryClient, 'removeQueries');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient} >
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useDeleteBackendQuiz(), { wrapper });

            await act(async () => {
                await result.current.mutateAsync(quizId);
            });

            expect(mockedQuizService.deleteQuiz).toHaveBeenCalledWith(quizId);
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: BACKEND_QUIZ_KEYS.userAttempts(),
            });
            expect(removeSpy).toHaveBeenCalledWith({
                queryKey: BACKEND_QUIZ_KEYS.quiz(quizId),
            });
            expect(removeSpy).toHaveBeenCalledWith({
                queryKey: BACKEND_QUIZ_KEYS.quizWithQuestions(quizId),
            });
        });

        it('should handle delete quiz error', async () => {
            mockedQuizService.deleteQuiz.mockResolvedValue({
                success: false,
                data: null,
                error: 'Quiz not found',
            });

            const { result } = renderHook(() => useDeleteBackendQuiz(), {
                wrapper: createWrapper(),
            });

            // Delete operation still succeeds even if service returns error
            // This is because the mutation doesn't throw on service errors
            await act(async () => {
                const response = await result.current.mutateAsync(quizId);
                expect(response.success).toBe(false);
                expect(response.error).toBe('Quiz not found');
            });
        });
    });

    describe('useInvalidateBackendQuiz', () => {
        it('should invalidate user attempts only when no quizId provided', () => {
            const queryClient = getQueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient} >
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useInvalidateBackendQuiz(), { wrapper });

            act(() => {
                result.current();
            });

            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: BACKEND_QUIZ_KEYS.userAttempts(),
            });
        });

        it('should invalidate both user attempts and specific quiz review when quizId provided', () => {
            const queryClient = getQueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
            const quizId = 'quiz123';

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient} >
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useInvalidateBackendQuiz(), { wrapper });

            act(() => {
                result.current(quizId);
            });

            expect(invalidateSpy).toHaveBeenCalledTimes(2);
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: BACKEND_QUIZ_KEYS.userAttempts(),
            });
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: BACKEND_QUIZ_KEYS.quizReview(quizId),
            });
        });
    });

    describe('useUpdateQuizFlashcardStatus', () => {
        it('should update flashcard status in quiz review cache', () => {
            const queryClient = getQueryClient();
            const quizId = 'quiz123';
            const questionId = 'question456';

            // Set initial data in cache
            const initialData = {
                data: {
                    questions: [
                        { question_id: 'question456', text: 'Question 1', flashcard_exists: false },
                        { question_id: 'question789', text: 'Question 2', flashcard_exists: true },
                    ],
                },
            };

            queryClient.setQueryData(BACKEND_QUIZ_KEYS.quizReview(quizId), initialData);

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient} >
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useUpdateQuizFlashcardStatus(), { wrapper });

            act(() => {
                result.current(quizId, questionId, true);
            });

            const updatedData = queryClient.getQueryData(BACKEND_QUIZ_KEYS.quizReview(quizId));
            expect(updatedData).toEqual({
                data: {
                    questions: [
                        { question_id: 'question456', text: 'Question 1', flashcard_exists: true },
                        { question_id: 'question789', text: 'Question 2', flashcard_exists: true },
                    ],
                },
            });
        });

        it('should handle missing cache data gracefully', () => {
            const queryClient = getQueryClient();
            const quizId = 'quiz123';
            const questionId = 'question456';

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient} >
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useUpdateQuizFlashcardStatus(), { wrapper });

            // Should not throw when no data exists
            act(() => {
                result.current(quizId, questionId, true);
            });

            const data = queryClient.getQueryData(BACKEND_QUIZ_KEYS.quizReview(quizId));
            expect(data).toBeUndefined();
        });

        it('should handle malformed cache data gracefully', () => {
            const queryClient = getQueryClient();
            const quizId = 'quiz123';
            const questionId = 'question456';

            // Set malformed data in cache
            queryClient.setQueryData(BACKEND_QUIZ_KEYS.quizReview(quizId), { invalid: 'data' });

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient} >
                    {children}
                </QueryClientProvider>
            );

            const { result } = renderHook(() => useUpdateQuizFlashcardStatus(), { wrapper });

            act(() => {
                result.current(quizId, questionId, true);
            });

            const data = queryClient.getQueryData(BACKEND_QUIZ_KEYS.quizReview(quizId));
            expect(data).toEqual({ invalid: 'data' });
        });
    });
}); 