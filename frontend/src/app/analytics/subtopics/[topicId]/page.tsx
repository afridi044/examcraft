'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ArrowLeft, 
  BookOpen, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Award,
  Filter,
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useTopicStats } from '@/hooks/useBackendAnalytics';
import { PageLoading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TopicProgress {
  topic_id: string;
  topic_name: string;
  parent_topic_id: string | null;
  parent_topic_name?: string;
  proficiency_level: number;
  questions_attempted: number;
  questions_correct: number;
  accuracy_percentage: number;
  last_activity: string | null;
}

export default function SubtopicsAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;
  
  const [subtopicFilter, setSubtopicFilter] = useState<string>("all");
  
  const { 
    data: topicStatsData, 
    isLoading, 
    error 
  } = useTopicStats();

  // Reset filter when topic changes
  useEffect(() => {
    setSubtopicFilter("all");
  }, [topicId]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Subtopic Analytics"
          subtitle="Preparing detailed analytics for subtopics..."
          variant="dashboard"
        />
      </DashboardLayout>
    );
  }

  if (error || !topicStatsData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Error Loading Analytics</h2>
            <p className="text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'Failed to load subtopic analytics data'}
            </p>
            <Button 
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Find the parent topic
  const parentTopic = topicStatsData.find(t => t.topic_id === topicId && !t.parent_topic_id);
  
  // Find all subtopics under this parent
  const subtopics = topicStatsData.filter(t => t.parent_topic_id === topicId);
  
  // Also find the parent topic itself if it has progress data
  const parentWithProgress = topicStatsData.find(t => t.topic_id === topicId);

  if (!parentTopic && !parentWithProgress) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Topic Not Found</h2>
            <p className="text-gray-400 mb-4">
              The requested topic could not be found or you don't have analytics data for it yet.
            </p>
            <Button 
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayTopic = parentTopic || parentWithProgress!;
  
  // Group subtopics for filtering
  const subtopicGroups = new Map<string, TopicProgress>();
  const standaloneProgress: TopicProgress[] = [];
  
  // Add parent topic data if it exists and has progress
  if (parentWithProgress && parentWithProgress.questions_attempted > 0) {
    standaloneProgress.push(parentWithProgress);
  }
  
  // Group subtopics
  subtopics.forEach(subtopic => {
    subtopicGroups.set(subtopic.topic_name, subtopic);
  });

  // Apply filter
  const filteredSubtopics = subtopicFilter === "all" 
    ? Array.from(subtopicGroups.values())
    : subtopicFilter === displayTopic.topic_name 
      ? []
      : [subtopicGroups.get(subtopicFilter)].filter(Boolean) as TopicProgress[];
  
  const showStandaloneProgress = subtopicFilter === "all" || subtopicFilter === displayTopic.topic_name;

  // Helper functions
  const getProficiencyColor = (level: number) => {
    if (level >= 80) return 'text-emerald-400';
    if (level >= 60) return 'text-amber-400';
    if (level >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProficiencyBgColor = (level: number) => {
    if (level >= 80) return 'bg-emerald-500/20';
    if (level >= 60) return 'bg-amber-500/20';
    if (level >= 40) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const getProficiencyIcon = (level: number) => {
    if (level >= 80) return <CheckCircle className="h-4 w-4" />;
    if (level >= 60) return <TrendingUp className="h-4 w-4" />;
    if (level >= 40) return <TrendingDown className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No activity yet';
    // Handle both ISO strings with Z and without Z
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActivityStatus = (dateString: string | null) => {
    if (!dateString) return { text: 'No activity yet', color: 'text-gray-500' };
    
    // Handle both ISO strings with Z and without Z
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return { 
        text: diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`, 
        color: 'text-emerald-400' 
      };
    } else if (diffInMinutes < 60) {
      return { 
        text: `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`, 
        color: 'text-emerald-400' 
      };
    } else if (diffInHours < 24) {
      return { 
        text: `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`, 
        color: 'text-emerald-400' 
      };
    } else if (diffInHours < 48) {
      return { text: 'Yesterday', color: 'text-emerald-400' };
    } else if (diffInDays <= 7) {
      return { text: `${diffInDays} days ago`, color: 'text-amber-400' };
    } else {
      return { text: `${diffInDays} days ago`, color: 'text-red-400' };
    }
  };

  // Calculate overall stats
  const totalQuestions = standaloneProgress.reduce((sum, p) => sum + p.questions_attempted, 0) + 
                        filteredSubtopics.reduce((sum, p) => sum + p.questions_attempted, 0);
  const totalCorrect = standaloneProgress.reduce((sum, p) => sum + p.questions_correct, 0) + 
                      filteredSubtopics.reduce((sum, p) => sum + p.questions_correct, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Professional Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-100 truncate">
                {displayTopic.topic_name}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm truncate">
                Subtopic performance analytics
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.back()}
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700 border-blue-500 flex-shrink-0"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Total Questions</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">{totalQuestions}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Correct</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-emerald-400 truncate">{totalCorrect}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Accuracy</p>
                <p className={`text-base sm:text-lg lg:text-xl font-bold ${getProficiencyColor(overallAccuracy)} truncate`}>
                  {overallAccuracy}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Section */}
        {subtopicGroups.size > 0 && (
          <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 bg-purple-500/20 rounded-lg flex-shrink-0">
                <Filter className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <Select value={subtopicFilter} onValueChange={setSubtopicFilter}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-gray-200 h-9 sm:h-10">
                    <SelectValue placeholder="All subtopics" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-gray-200 focus:bg-slate-700">
                      All subtopics
                    </SelectItem>
                    {standaloneProgress.length > 0 && (
                      <SelectItem value={displayTopic.topic_name} className="text-gray-200 focus:bg-slate-700">
                        {displayTopic.topic_name} only
                      </SelectItem>
                    )}
                    {Array.from(subtopicGroups.keys()).map((subtopicName) => (
                      <SelectItem key={subtopicName} value={subtopicName} className="text-gray-200 focus:bg-slate-700">
                        {subtopicName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3 sm:space-y-4">
          {/* Parent Topic and Subtopic Sections in 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Parent Topic Section */}
            {showStandaloneProgress && standaloneProgress.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-900/80 border-slate-800/80 hover:bg-slate-900/40 transition-colors h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-100 flex items-center gap-2 text-sm sm:text-base font-semibold">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="flex-1 truncate">{displayTopic.topic_name}</span>
                    </CardTitle>
                                          <p className="text-xs sm:text-sm text-gray-400 pl-8 truncate">
                        {standaloneProgress[0].questions_attempted} questions • {getActivityStatus(standaloneProgress[0].last_activity).text}
                      </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <p className="text-sm font-bold text-gray-100 truncate">{standaloneProgress[0].questions_attempted}</p>
                        <p className="text-xs text-gray-400 truncate">Questions</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <p className="text-sm font-bold text-emerald-400 truncate">{standaloneProgress[0].questions_correct}</p>
                        <p className="text-xs text-gray-400 truncate">Correct</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <p className={`text-sm font-bold ${getProficiencyColor(standaloneProgress[0].accuracy_percentage)} truncate`}>
                          {standaloneProgress[0].accuracy_percentage}%
                        </p>
                        <p className="text-xs text-gray-400 truncate">Accuracy</p>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-300 truncate">{formatDate(standaloneProgress[0].last_activity)}</p>
                        <p className="text-xs text-gray-400 truncate">Last Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Subtopic Sections */}
            {filteredSubtopics.map((subtopic, index) => {
              const activityStatus = getActivityStatus(subtopic.last_activity);
              
              return (
                <motion.div
                  key={subtopic.topic_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (showStandaloneProgress && standaloneProgress.length > 0 ? 0.2 : 0) + index * 0.1 
                  }}
                >
                  <Card className="bg-slate-900/80 border-slate-800/80 hover:bg-slate-900/40 transition-colors h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gray-100 flex items-center gap-2 text-sm sm:text-base font-semibold">
                        <div className={`p-1.5 ${getProficiencyBgColor(subtopic.accuracy_percentage)} rounded-lg flex-shrink-0`}>
                          <Target className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="flex-1 truncate">{subtopic.topic_name}</span>
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-gray-400 pl-8 truncate">
                        {subtopic.questions_attempted} questions • {activityStatus.text}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                          <p className="text-sm font-bold text-gray-100 truncate">{subtopic.questions_attempted}</p>
                          <p className="text-xs text-gray-400 truncate">Questions</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                          <p className="text-sm font-bold text-emerald-400 truncate">{subtopic.questions_correct}</p>
                          <p className="text-xs text-gray-400 truncate">Correct</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                          <p className={`text-sm font-bold ${getProficiencyColor(subtopic.accuracy_percentage)} truncate`}>
                            {subtopic.accuracy_percentage}%
                          </p>
                          <p className="text-xs text-gray-400 truncate">Accuracy</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                          <p className="text-xs font-semibold text-gray-300 truncate">{formatDate(subtopic.last_activity)}</p>
                          <p className="text-xs text-gray-400 truncate">Last Active</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* No results message */}
          {filteredSubtopics.length === 0 && !showStandaloneProgress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-4 sm:p-6 text-center">
                <div className="p-3 bg-slate-800/50 rounded-lg inline-block mb-4">
                  <Filter className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-100 mb-2">No Data for Selected Filter</h3>
                <p className="text-sm text-gray-400">Try selecting a different subtopic or "All subtopics"</p>
              </Card>
            </motion.div>
          )}

          {/* Empty state */}
          {subtopicGroups.size === 0 && standaloneProgress.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-6 sm:p-8 text-center">
                <div className="p-4 bg-slate-800/50 rounded-lg inline-block mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">No Analytics Data</h3>
                <p className="text-gray-400 mb-4">
                  Start answering questions for this topic to see detailed analytics
                </p>
                <Button 
                  onClick={() => router.push('/quiz/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create a Quiz
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 