"use client";

import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { 
  useSimpleDashboardStats, 
  useSimpleRecentActivity, 
  useSimpleTopicProgress 
} from "@/hooks/useSimpleDashboard";
import { dashboardService } from "@/lib/services";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SimpleDashboard() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading, signOut } = useSimpleAuth();
  const [manualTestResult, setManualTestResult] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use simple hooks (no React Query) - only after mounting
  const statsQuery = useSimpleDashboardStats(isMounted ? (currentUser?.id || '') : '');
  const activityQuery = useSimpleRecentActivity(isMounted ? (currentUser?.id || '') : '');
  const progressQuery = useSimpleTopicProgress(isMounted ? (currentUser?.id || '') : '');

  // Manual API test function (keep for comparison)
  const testAPIDirectly = async () => {
    if (!currentUser?.id) return;
    
    console.log('🧪 Testing API directly with userId:', currentUser.id);
    setManualTestResult({ loading: true });
    
    try {
      const result = await dashboardService.getAllDashboardData(currentUser.id);
      console.log('🧪 Direct API test result:', result);
      setManualTestResult({ success: true, data: result });
    } catch (error) {
      console.error('🧪 Direct API test failed:', error);
      setManualTestResult({ success: false, error: error });
    }
  };

  const refreshData = () => {
    console.log("🔄 Manual refresh requested - refetching all individual hooks");
    statsQuery.refetch();
    activityQuery.refetch();
    progressQuery.refetch();
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push("/auth/signin");
    }
  }, [userLoading, currentUser, router]);

  // Debug: Log hook states
  useEffect(() => {
    console.log('🔍 Individual Hook States:', {
      stats: {
        isLoading: statsQuery.isLoading,
        isError: statsQuery.isError,
        hasData: !!statsQuery.data,
        data: statsQuery.data
      },
      activity: {
        isLoading: activityQuery.isLoading,
        isError: activityQuery.isError,
        hasData: !!activityQuery.data,
        data: activityQuery.data
      },
      progress: {
        isLoading: progressQuery.isLoading,
        isError: progressQuery.isError,
        hasData: !!progressQuery.data,
        data: progressQuery.data
      }
    });
  }, [statsQuery, activityQuery, progressQuery]);

  if (userLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to sign-in
  }

  // More lenient loading check - only show loading if ALL queries are loading AND have no data
  const isLoading = (statsQuery.isLoading && !statsQuery.data) && 
                   (activityQuery.isLoading && !activityQuery.data) && 
                   (progressQuery.isLoading && !progressQuery.data);
  const hasError = statsQuery.isError || activityQuery.isError || progressQuery.isError;

  // DEBUG: Log loading states
  console.log('🎨 Simple Dashboard Render State:', {
    isLoading,
    hasError,
    stats: { isLoading: statsQuery.isLoading, hasData: !!statsQuery.data },
    activity: { isLoading: activityQuery.isLoading, hasData: !!activityQuery.data },
    progress: { isLoading: progressQuery.isLoading, hasData: !!progressQuery.data }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simple Dashboard (No React Query)</h1>
          <p className="mt-2 text-gray-600">
            Testing simple hooks without React Query: useSimpleDashboardStats, useSimpleRecentActivity, useSimpleTopicProgress
          </p>
          <p className="mt-1 text-sm text-blue-600">
            User ID: {currentUser.id} | Email: {currentUser.email}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Controls & Debug</h2>
          
          <div className="space-y-4">
            {/* Refresh Button */}
            <div>
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🔄 Refresh All Data
              </button>
            </div>

            {/* Individual Hook Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Stats Hook</h3>
                <div className="text-sm space-y-1">
                  <div>Status: <span className={`${statsQuery.isLoading ? 'text-blue-600' : statsQuery.isError ? 'text-red-600' : 'text-green-600'}`}>
                    {statsQuery.isLoading ? "Loading..." : statsQuery.isError ? "Error" : "Success"}
                  </span></div>
                  <div>Data: <span className="text-purple-600">{statsQuery.data ? "YES" : "NO"}</span></div>
                  {statsQuery.error && <div className="text-red-600 text-xs">Error: {(statsQuery.error as any)?.message}</div>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Activity Hook</h3>
                <div className="text-sm space-y-1">
                  <div>Status: <span className={`${activityQuery.isLoading ? 'text-blue-600' : activityQuery.isError ? 'text-red-600' : 'text-green-600'}`}>
                    {activityQuery.isLoading ? "Loading..." : activityQuery.isError ? "Error" : "Success"}
                  </span></div>
                  <div>Data: <span className="text-purple-600">{activityQuery.data ? `${Array.isArray(activityQuery.data) ? activityQuery.data.length : 1} items` : "NO"}</span></div>
                  {activityQuery.error && <div className="text-red-600 text-xs">Error: {(activityQuery.error as any)?.message}</div>}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Progress Hook</h3>
                <div className="text-sm space-y-1">
                  <div>Status: <span className={`${progressQuery.isLoading ? 'text-blue-600' : progressQuery.isError ? 'text-red-600' : 'text-green-600'}`}>
                    {progressQuery.isLoading ? "Loading..." : progressQuery.isError ? "Error" : "Success"}
                  </span></div>
                  <div>Data: <span className="text-purple-600">{progressQuery.data ? `${Array.isArray(progressQuery.data) ? progressQuery.data.length : 1} items` : "NO"}</span></div>
                  {progressQuery.error && <div className="text-red-600 text-xs">Error: {(progressQuery.error as any)?.message}</div>}
                </div>
              </div>
            </div>

            {/* Manual API Test */}
            <div>
              <button
                onClick={testAPIDirectly}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                🧪 Test Batched API Directly
              </button>

              {manualTestResult && (
                <div className="mt-2 p-2 bg-white rounded border text-xs">
                  <div className="font-medium mb-1">Direct API Test Result:</div>
                  <pre className="overflow-auto max-h-32">
                    {JSON.stringify(manualTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Data Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Data (Individual Hooks)</h2>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Loading dashboard data...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-medium mb-2">Error Loading Data</h3>
              <div className="space-y-1 text-sm">
                {statsQuery.isError && <p className="text-red-600">Stats: {(statsQuery.error as any)?.message}</p>}
                {activityQuery.isError && <p className="text-red-600">Activity: {(activityQuery.error as any)?.message}</p>}
                {progressQuery.isError && <p className="text-red-600">Progress: {(progressQuery.error as any)?.message}</p>}
              </div>
            </div>
          )}

          {/* Success State - Show Data */}
          {!isLoading && (
            <div className="space-y-6">
              {/* DEBUG: Show what data we have */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">Debug: Data Status</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <div>Stats Data: {statsQuery.data ? "✅ YES" : "❌ NO"} (Type: {typeof statsQuery.data})</div>
                  <div>Activity Data: {activityQuery.data ? "✅ YES" : "❌ NO"} (Length: {Array.isArray(activityQuery.data) ? activityQuery.data.length : "Not Array"})</div>
                  <div>Progress Data: {progressQuery.data ? "✅ YES" : "❌ NO"} (Length: {Array.isArray(progressQuery.data) ? progressQuery.data.length : "Not Array"})</div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
                {statsQuery.data ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(statsQuery.data).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    {statsQuery.isError ? "Failed to load stats" : "No stats data"}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
                {activityQuery.data && Array.isArray(activityQuery.data) && activityQuery.data.length > 0 ? (
                  <div className="space-y-3">
                    {activityQuery.data.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {activity.title || "Activity"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {activity.type} {activity.topic ? `- ${activity.topic}` : ""}
                              {activity.score !== undefined ? ` (Score: ${activity.score})` : ""}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {activity.completed_at ? new Date(activity.completed_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    {activityQuery.isError ? "Failed to load activity" : "No recent activity"}
                  </div>
                )}
              </div>

              {/* Topic Progress */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Topic Progress</h3>
                {progressQuery.data && Array.isArray(progressQuery.data) && progressQuery.data.length > 0 ? (
                  <div className="space-y-3">
                    {progressQuery.data.map((topic: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-900">
                            {topic.topic_name || `Topic ${index + 1}`}
                          </h4>
                          <span className="text-sm text-gray-600">
                            {topic.progress_percentage || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${topic.progress_percentage || 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{topic.questions_correct}/{topic.questions_attempted} correct</span>
                          <span>Last: {topic.last_activity ? new Date(topic.last_activity).toLocaleDateString() : "Never"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                    {progressQuery.isError ? "Failed to load progress" : "No topic progress"}
                  </div>
                )}
              </div>

              {/* Raw Data Display (for debugging) */}
              <details className="mt-6">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                  Show Raw Hook Data (Debug)
                </summary>
                <div className="mt-2 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Stats Hook Data:</h4>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(statsQuery.data, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Activity Hook Data:</h4>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(activityQuery.data, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Progress Hook Data:</h4>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(progressQuery.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
