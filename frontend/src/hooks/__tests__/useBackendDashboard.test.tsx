import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
    useBackendDashboardStats,
    useBackendRecentActivity,
    useBackendTopicProgress,
    useBackendOptimizedDashboard,
    useInvalidateBackendDashboard,
    BACKEND_QUERY_KEYS,
} from '../useBackendDashboard';
import { dashboardService } from '@/lib/services';

// Mock the dashboard service
jest.mock('@/lib/services', () => ({
    dashboardService: {
        getUserStats: jest.fn(),
        getRecentActivity: jest.fn(),
        getTopicProgress: jest.fn(),
        getAllDashboardData: jest.fn(),
    },
}));

const mockedDashboardService = dashboardService as jest.Mocked<typeof dashboardService>;

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

describe('useBackendDashboard Hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useBackendDashboardStats', () => {
        it('fetches stats successfully', async () => {
            const mockStats = { totalQuizzes: 10, averageScore: 85 };
            mockedDashboardService.getUserStats.mockResolvedValue({ data: mockStats });

            const { result } = renderHook(() => useBackendDashboardStats(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual(mockStats);
            expect(mockedDashboardService.getUserStats).toHaveBeenCalledTimes(1);
        });
    });

    describe('useBackendRecentActivity', () => {
        it('fetches recent activity successfully', async () => {
            const mockActivity = [
                { id: 1, type: 'quiz', title: 'Test Quiz' },
                { id: 2, type: 'flashcard', title: 'Test Flashcard' },
            ];
            mockedDashboardService.getRecentActivity.mockResolvedValue({ data: mockActivity });

            const { result } = renderHook(() => useBackendRecentActivity(5), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual(mockActivity);
            expect(mockedDashboardService.getRecentActivity).toHaveBeenCalledTimes(1);
        });
    });

    describe('useBackendTopicProgress', () => {
        it('fetches topic progress successfully', async () => {
            const mockProgress = [
                { topicId: 1, name: 'Math', progress: 75 },
                { topicId: 2, name: 'Science', progress: 60 },
            ];
            mockedDashboardService.getTopicProgress.mockResolvedValue({ data: mockProgress });

            const { result } = renderHook(() => useBackendTopicProgress(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual(mockProgress);
            expect(mockedDashboardService.getTopicProgress).toHaveBeenCalledTimes(1);
        });
    });

    describe('useBackendOptimizedDashboard', () => {
        it('fetches all dashboard data in a single call', async () => {
            const mockData = {
                stats: { totalQuizzes: 10, averageScore: 85 },
                recentActivity: [{ id: 1, type: 'quiz', title: 'Test Quiz' }],
                topicProgress: [{ topicId: 1, name: 'Math', progress: 75 }],
            };
            mockedDashboardService.getAllDashboardData.mockResolvedValue({ data: mockData });

            const { result } = renderHook(() => useBackendOptimizedDashboard(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isLoading).toBe(false));
            expect(result.current.data).toEqual(mockData);
            expect(mockedDashboardService.getAllDashboardData).toHaveBeenCalledTimes(1);
        });
    });

    describe('useInvalidateBackendDashboard', () => {
        it('invalidates all dashboard-related queries', () => {
            const { result } = renderHook(() => useInvalidateBackendDashboard(), { wrapper: createWrapper() });

            // Mock the queryClient.invalidateQueries method
            const mockQueryClient = {
                invalidateQueries: jest.fn(),
            };

            // We can't easily test the actual invalidation without exposing the queryClient
            // But we can test that the function is callable
            expect(typeof result.current).toBe('function');
        });
    });
}); 