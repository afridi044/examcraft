import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useBackendTopics, TOPIC_QUERY_KEYS } from '../useBackendTopics';
import { topicService } from '@/lib/services/topic.service';

// Mock the topic service
jest.mock('@/lib/services/topic.service', () => ({
    topicService: {
        getAllTopics: jest.fn(),
    },
}));

const mockedTopicService = topicService as jest.Mocked<typeof topicService>;

// Create a wrapper for React Query
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
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

describe('useBackendTopics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches all topics successfully', async () => {
        const mockTopics = [
            { id: '1', name: 'Mathematics', description: 'Math topics' },
            { id: '2', name: 'Science', description: 'Science topics' },
        ];
        mockedTopicService.getAllTopics.mockResolvedValue({
            success: true,
            data: mockTopics,
            error: null,
        });

        const { result } = renderHook(() => useBackendTopics(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(mockTopics);
        expect(mockedTopicService.getAllTopics).toHaveBeenCalledTimes(1);
    });

    it('handles error response', async () => {
        mockedTopicService.getAllTopics.mockResolvedValue({
            success: false,
            data: null,
            error: 'Failed to fetch topics',
        });

        const { result } = renderHook(() => useBackendTopics(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeTruthy();
    });

    it('returns empty array when no data is returned', async () => {
        mockedTopicService.getAllTopics.mockResolvedValue({
            success: true,
            data: null,
            error: null,
        });

        const { result } = renderHook(() => useBackendTopics(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual([]);
    });
}); 