"use client";

import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useBackendOptimizedDashboard, useInvalidateBackendDashboard } from "@/hooks/useBackendDashboard";
import { dashboardService } from "@/lib/services";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function DashboardDebug() {
  const { user, loading: authLoading, isAuthenticated } = useBackendAuth();
  const userId = user?.id || "0cb61931-c985-47eb-ab64-c62ffa3b8762";
  const dashboardData = useBackendOptimizedDashboard(userId);
  const invalidateDashboard = useInvalidateBackendDashboard();
  const queryClient = useQueryClient();
  const [manualTestResult, setManualTestResult] = useState<any>(null);

  const testDirectAPICall = async () => {
    console.log('🧪 Testing direct API call...');
    try {
      const result = await dashboardService.getAllDashboardData(userId);
      setManualTestResult(result);
      console.log('🧪 Direct API call result:', result);
    } catch (error) {
      console.error('🧪 Direct API call failed:', error);
      setManualTestResult({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const clearCache = () => {
    console.log('🗑️ Clearing React Query cache...');
    queryClient.clear();
    invalidateDashboard(userId);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-300 mb-6">
      <h3 className="text-lg font-bold text-black mb-4">🐛 Dashboard Debug Info</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong className="text-blue-600">Auth State:</strong>
          <div className="ml-4 text-black">
            <div>Loading: {authLoading ? 'Yes' : 'No'}</div>
            <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
            <div>User ID: {user?.id || 'None'}</div>
            <div>Auth ID: {user?.auth_id || 'None'}</div>
            <div>Email: {user?.email || 'None'}</div>
          </div>
        </div>

        <div>
          <strong className="text-green-600">Dashboard Query:</strong>
          <div className="ml-4 text-black">
            <div>User ID being used: {userId}</div>
            <div>Is Loading: {dashboardData.isLoading ? 'Yes' : 'No'}</div>
            <div>Is Error: {dashboardData.isError ? 'Yes' : 'No'}</div>
            <div>Error: {String(dashboardData.error || 'None')}</div>
            <div>Has Data: {dashboardData.data ? 'Yes' : 'No'}</div>
            <div>Stats: {JSON.stringify(dashboardData.data?.stats || {})}</div>
            <div>Activity Count: {dashboardData.data?.recentActivity?.length || 0}</div>
            <div>Progress Count: {dashboardData.data?.topicProgress?.length || 0}</div>
          </div>
        </div>

        <div>
          <strong className="text-purple-600">Backend URL:</strong>
          <div className="ml-4 text-black">
            {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api/v1'}
          </div>
        </div>

        <div>
          <button 
            onClick={testDirectAPICall}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white mr-2"
          >
            Test Direct API Call
          </button>
          <button 
            onClick={clearCache}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Clear Cache & Refresh
          </button>
          {manualTestResult && (
            <div className="mt-2 p-2 bg-gray-100 rounded border">
              <strong className="text-black">Manual Test Result:</strong>
              <pre className="text-xs overflow-auto text-black">
                {JSON.stringify(manualTestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
