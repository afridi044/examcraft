import { renderHook, act, waitFor } from '@testing-library/react';
import { useFlashcardData } from '../useFlashcardData';
import { useUserFlashcards } from '@/hooks/useBackendFlashcards';
import { calculateFlashcardStats, FLASHCARD_3D_STYLES } from '@/lib/utils/flashcards';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// --- Mocks ---
jest.mock('@/hooks/useBackendFlashcards');
jest.mock('@/lib/utils/flashcards');

const mockedUseUserFlashcards = useUserFlashcards as jest.Mock;
const mockedCalculateFlashcardStats = calculateFlashcardStats as jest.Mock;

const mockRefetch = jest.fn();
const mockScrollTo = jest.fn();

// --- Test Setup ---
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useFlashcardData', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock the initial return value for our dependency hook
        mockedUseUserFlashcards.mockReturnValue({
            data: [],
            isLoading: true,
            refetch: mockRefetch,
        });

        // Mock the stats utility
        mockedCalculateFlashcardStats.mockReturnValue({
            totalFlashcards: 0,
            topicStats: [],
            overallProgress: 0,
            selectedTopicName: '',
            selectedTopicFlashcards: [],
        });

        // Mock window.scrollTo
        window.scrollTo = mockScrollTo;

        // Clear any lingering style tags
        const existingStyle = document.querySelector("#flashcard-3d-styles");
        if (existingStyle) {
            existingStyle.remove();
        }
    });

    // --- Tests ---

    it('should return initial loading state and stats correctly', () => {
        const { result } = renderHook(() => useFlashcardData(), { wrapper: createWrapper() });

        expect(result.current.isLoadingFlashcards).toBe(true);
        expect(result.current.flashcards).toEqual([]);
        expect(result.current.stats).toBeDefined();
        expect(mockedCalculateFlashcardStats).toHaveBeenCalledWith([], null);
    });

    it('should calculate stats when flashcards data changes', () => {
        const mockFlashcards = [{ id: '1', front: 'Q', back: 'A' }];
        mockedUseUserFlashcards.mockReturnValue({
            data: mockFlashcards,
            isLoading: false,
            refetch: mockRefetch,
        });

        const { result } = renderHook(() => useFlashcardData('topic1'), { wrapper: createWrapper() });

        expect(result.current.isLoadingFlashcards).toBe(false);
        expect(result.current.flashcards).toEqual(mockFlashcards);
        expect(mockedCalculateFlashcardStats).toHaveBeenCalledWith(mockFlashcards, 'topic1');
    });

    it('should inject and clean up 3D styles from the DOM', () => {
        const { unmount } = renderHook(() => useFlashcardData(), { wrapper: createWrapper() });

        // Check if style tag was added
        const styleTag = document.querySelector("#flashcard-3d-styles");
        expect(styleTag).toBeInTheDocument();
        expect(styleTag?.innerHTML).toBe(FLASHCARD_3D_STYLES);

        // Unmount the hook and check if the style tag was removed
        unmount();
        const removedStyleTag = document.querySelector("#flashcard-3d-styles");
        expect(removedStyleTag).not.toBeInTheDocument();
    });

    it('should not inject styles if they already exist', () => {
        // Manually add the style tag first
        const style = document.createElement("style");
        style.id = "flashcard-3d-styles";
        document.head.appendChild(style);

        const { unmount } = renderHook(() => useFlashcardData(), { wrapper: createWrapper() });

        // There should still be only one style tag
        expect(document.querySelectorAll("#flashcard-3d-styles").length).toBe(1);
        unmount();
    });

    it('should scroll to top when selectedTopicId changes', () => {
        const { rerender } = renderHook(
            ({ topicId }) => useFlashcardData(topicId),
            {
                initialProps: { topicId: null },
                wrapper: createWrapper()
            }
        );

        expect(mockScrollTo).not.toHaveBeenCalled();

        // Change the topic ID
        rerender({ topicId: 'new-topic' });

        expect(mockScrollTo).toHaveBeenCalledWith({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    });

    describe('event listeners for refetching', () => {
        // Use fake timers to control setTimeout
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should refetch on visibilitychange', () => {
            renderHook(() => useFlashcardData(), { wrapper: createWrapper() });

            // Simulate page becoming visible
            Object.defineProperty(document, 'hidden', { value: false });
            document.dispatchEvent(new Event('visibilitychange'));

            act(() => {
                jest.runAllTimers();
            });

            expect(mockRefetch).toHaveBeenCalledTimes(2); // Called immediately and in a timeout
        });

        it('should refetch on window focus', () => {
            renderHook(() => useFlashcardData(), { wrapper: createWrapper() });

            window.dispatchEvent(new Event('focus'));

            act(() => {
                jest.runAllTimers();
            });

            expect(mockRefetch).toHaveBeenCalledTimes(1);
        });

        it('should attach and detach event listeners correctly', () => {
            const addSpy = jest.spyOn(window, 'addEventListener');
            const removeSpy = jest.spyOn(window, 'removeEventListener');

            const { unmount } = renderHook(() => useFlashcardData(), { wrapper: createWrapper() });

            expect(addSpy).toHaveBeenCalledWith('focus', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('pageshow', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

            unmount();

            expect(removeSpy).toHaveBeenCalledWith('focus', expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith('pageshow', expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
        });
    });
}); 