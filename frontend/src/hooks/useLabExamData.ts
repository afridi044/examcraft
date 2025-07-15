import { useState, useEffect } from 'react';
import { dashboardService } from '@/lib/services/dashboard.service';
import type { ApiResponse } from '@/types';

// =============================================
// LAB EXAM TEMPLATE HOOK - TOPICS
// =============================================
// This hook fetches topics and creates new topics

interface LabExamFilters {
    limit?: number;
}

interface TopicData {
    topic_id: string;
    name: string;
    description: string | null;
    parent_topic_id: string | null;
}

interface CreateTopicData {
    name: string;
    description?: string;
}

export const useLabExamData = (filters?: LabExamFilters) => {
    const [data, setData] = useState<TopicData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response: ApiResponse<TopicData[]> = await dashboardService.getLabExamData(filters);

                if (response.success && response.data) {
                    setData(response.data);
                } else {
                    setError(response.error || 'Failed to fetch topics data');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    const refetch = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response: ApiResponse<TopicData[]> = await dashboardService.getLabExamData(filters);

            if (response.success && response.data) {
                setData(response.data);
            } else {
                setError(response.error || 'Failed to fetch topics data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const createTopic = async (topicData: CreateTopicData) => {
        try {
            setError(null);
            const response: ApiResponse<TopicData> = await dashboardService.createLabExamData(topicData);

            if (response.success && response.data) {
                // Refresh the topics list after creating
                await refetch();
                return { success: true, data: response.data };
            } else {
                setError(response.error || 'Failed to create topic');
                return { success: false, error: response.error };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    return {
        data,
        isLoading,
        error,
        refetch,
        createTopic,
    };
}; 