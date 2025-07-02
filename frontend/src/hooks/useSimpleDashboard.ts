// Simple Dashboard Hooks without React Query
import { useState, useEffect } from "react";
import { dashboardService } from "@/lib/services";

// =============================================
// Simple Individual Hooks (No React Query)
// =============================================

export function useSimpleDashboardStats(userId: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    if (!userId || !isMounted) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await dashboardService.getUserStats(userId);
      console.log('📊 Simple Stats Hook - Raw response:', response);
      
      // API client now properly unwraps backend response
      // Clean access to data without double nesting
      setData(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Simple Stats Hook - Error:', err);
      setError(err);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchData();
    }
  }, [userId, isMounted]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

export function useSimpleRecentActivity(userId: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    if (!userId || !isMounted) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await dashboardService.getRecentActivity(userId);
      console.log('📊 Simple Activity Hook - Raw response:', response);
      
      // API client now properly unwraps backend response
      const result = Array.isArray(response.data) ? response.data : [];
      console.log('📊 Simple Activity Hook - Final data:', result);
      
      setData(result);
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Simple Activity Hook - Error:', err);
      setError(err);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchData();
    }
  }, [userId, isMounted]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

export function useSimpleTopicProgress(userId: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    if (!userId || !isMounted) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await dashboardService.getTopicProgress(userId);
      console.log('📊 Simple Progress Hook - Raw response:', response);
      
      // API client now properly unwraps backend response
      const result = Array.isArray(response.data) ? response.data : [];
      console.log('📊 Simple Progress Hook - Final data:', result);
      
      setData(result);
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Simple Progress Hook - Error:', err);
      setError(err);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchData();
    }
  }, [userId, isMounted]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

// =============================================
// Compound Simple Hook
// =============================================

export function useSimpleDashboardData(userId: string) {
  const stats = useSimpleDashboardStats(userId);
  const activity = useSimpleRecentActivity(userId);
  const progress = useSimpleTopicProgress(userId);

  const isLoading = stats.isLoading || activity.isLoading || progress.isLoading;
  const isError = stats.isError || activity.isError || progress.isError;
  const error = stats.error || activity.error || progress.error;

  return {
    stats,
    recentActivity: activity,
    topicProgress: progress,
    isLoading,
    isError,
    error,
  };
}
