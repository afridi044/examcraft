'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react';

interface TopicProgress {
  topic_id: string;
  topic_name: string;
  parent_topic_id: string | null;
  parent_topic_name?: string;
  proficiency_level: number;
  questions_attempted: number;
  questions_correct: number;
  accuracy_percentage: number;
  last_activity: string;
}

interface TopicStatsProps {
  data: TopicProgress[];
}

interface GroupedTopics {
  [parentId: string]: {
    parent: TopicProgress;
    children: TopicProgress[];
  };
}

export function TopicStats({ data }: TopicStatsProps) {
  const [expandedParents, setExpandedParents] = React.useState<Set<string>>(new Set());
  const [selectedView, setSelectedView] = React.useState<'overview' | 'detailed'>('overview');

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
        <div className="text-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2">No Topic Data Available</h3>
          <p className="text-gray-400 max-w-md text-sm sm:text-base">Start answering questions to see your detailed topic progress analysis</p>
        </div>
      </div>
    );
  }

  // Group topics by parent
  const groupedTopics: GroupedTopics = {};
  const parentTopics: TopicProgress[] = [];
  const childTopics: TopicProgress[] = [];

  data.forEach(topic => {
    if (!topic.parent_topic_id) {
      parentTopics.push(topic);
      groupedTopics[topic.topic_id] = {
        parent: topic,
        children: []
      };
    } else {
      childTopics.push(topic);
      if (groupedTopics[topic.parent_topic_id]) {
        groupedTopics[topic.parent_topic_id].children.push(topic);
      }
    }
  });

  // Sort parent topics by accuracy percentage
  parentTopics.sort((a, b) => b.accuracy_percentage - a.accuracy_percentage);

  const toggleParent = (parentId: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 80) return 'text-emerald-400';
    if (level >= 60) return 'text-amber-400';
    if (level >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProficiencyBgColor = (level: number) => {
    if (level >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (level >= 60) return 'bg-amber-500/10 border-amber-500/20';
    if (level >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Advanced';
    if (level >= 40) return 'Intermediate';
    return 'Beginner';
  };

  const getProficiencyIcon = (level: number) => {
    if (level >= 80) return <Star className="h-3 w-3" />;
    if (level >= 60) return <Award className="h-3 w-3" />;
    if (level >= 40) return <TrendingUp className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'Z');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysSinceLastActivity = (dateString: string) => {
    const lastActivity = new Date(dateString + 'Z');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getActivityStatus = (days: number) => {
    if (days === 0) return { text: 'Today', color: 'text-emerald-400' };
    if (days === 1) return { text: 'Yesterday', color: 'text-emerald-400' };
    if (days <= 7) return { text: `${days} days ago`, color: 'text-amber-400' };
    return { text: `${days} days ago`, color: 'text-red-400' };
  };

  // Overview View Component
  const OverviewView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {parentTopics.map((parentTopic, index) => {
        const children = groupedTopics[parentTopic.topic_id]?.children || [];
        const activityStatus = getActivityStatus(getDaysSinceLastActivity(parentTopic.last_activity));

        return (
          <motion.div
            key={parentTopic.topic_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300"
          >
            <div className="p-3 sm:p-4 relative">
              {/* Proficiency Badge - Top Right */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full border ${getProficiencyBgColor(parentTopic.accuracy_percentage)}`}>
                <div className="flex items-center space-x-1">
                  {getProficiencyIcon(parentTopic.accuracy_percentage)}
                  <span className={`text-xs font-semibold ${getProficiencyColor(parentTopic.accuracy_percentage)} hidden sm:inline`}>
                    {getProficiencyLabel(parentTopic.accuracy_percentage)}
                  </span>
                </div>
              </div>

              {/* Header Section */}
              <div className="flex flex-col gap-2 mb-3 pr-12">
                {/* Topic Info */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-100 mb-1">{parentTopic.topic_name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-400">
                      <span>{children.length} subtopic{children.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex items-center justify-end">
                  {/* Empty space for future actions if needed */}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      parentTopic.accuracy_percentage >= 80 ? 'bg-emerald-500' :
                      parentTopic.accuracy_percentage >= 60 ? 'bg-amber-500' :
                      parentTopic.accuracy_percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${parentTopic.accuracy_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // Detailed View Component
  const DetailedView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {parentTopics.map((parentTopic, index) => {
        const children = groupedTopics[parentTopic.topic_id]?.children || [];
        const isExpanded = expandedParents.has(parentTopic.topic_id);
        const hasChildren = children.length > 0;
        const daysSinceActivity = getDaysSinceLastActivity(parentTopic.last_activity);
        const activityStatus = getActivityStatus(daysSinceActivity);

        return (
          <motion.div
            key={parentTopic.topic_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300"
          >
            {/* Main Topic Card */}
            <div className="p-3 sm:p-4">
              {/* Header Section */}
              <div className="flex flex-col gap-3 mb-3">
                {/* Topic Info */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-100 mb-1">{parentTopic.topic_name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-3">
                        <span>{children.length} subtopic{children.length !== 1 ? 's' : ''}</span>
                        <span className={`sm:hidden ${activityStatus.color}`}>{activityStatus.text}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span className={`hidden sm:inline ${activityStatus.color}`}>{activityStatus.text}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end">
                  {/* Expand/Collapse Button */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleParent(parentTopic.topic_id)}
                      className="p-1.5 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/50">
                <div className="text-center p-2 bg-slate-800/30 rounded-lg">
                  <p className="text-sm sm:text-lg font-bold text-gray-100 mb-0.5">{parentTopic.questions_attempted}</p>
                  <p className="text-xs text-gray-400">Questions Attempted</p>
                </div>
                <div className="text-center p-2 bg-slate-800/30 rounded-lg">
                  <p className="text-sm sm:text-lg font-bold text-emerald-400 mb-0.5">{parentTopic.questions_correct}</p>
                  <p className="text-xs text-gray-400">Correct Answers</p>
                </div>
                <div className="text-center p-2 bg-slate-800/30 rounded-lg">
                  <p className={`text-sm sm:text-lg font-bold ${getProficiencyColor(parentTopic.proficiency_level)} mb-0.5`}>{parentTopic.proficiency_level}%</p>
                  <p className="text-xs text-gray-400">Proficiency Level</p>
                </div>
                <div className="text-center p-2 bg-slate-800/30 rounded-lg">
                  <p className="text-xs sm:text-sm font-semibold text-gray-300 mb-0.5">{formatDate(parentTopic.last_activity)}</p>
                  <p className="text-xs text-gray-400">Last Activity</p>
                </div>
              </div>
            </div>

            {/* Children Topics */}
            {hasChildren && isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-slate-700/50 bg-slate-800/30"
              >
                <div className="p-3 sm:p-4">
                  <h5 className="text-sm sm:text-base font-semibold text-gray-200 mb-3 flex items-center">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-400" />
                    Subtopics ({children.length})
                  </h5>
                  <div className="space-y-2">
                    {children.map((child, childIndex) => (
                      <motion.div
                        key={child.topic_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: childIndex * 0.05 }}
                        className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Child Topic Header */}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Target className="h-3 w-3 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm text-gray-200 mb-0.5">{child.topic_name}</p>
                              <p className="text-xs text-gray-400">
                                {child.questions_attempted} questions • {getDaysSinceLastActivity(child.last_activity)} days ago
                              </p>
                            </div>
                          </div>
                          
                          {/* Child Topic Stats */}
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className={`text-sm font-bold ${getProficiencyColor(child.accuracy_percentage)}`}>
                                {child.accuracy_percentage}%
                              </p>
                              <p className="text-xs text-gray-400">{getProficiencyLabel(child.accuracy_percentage)}</p>
                            </div>
                            
                            <div className="flex items-center space-x-1 text-xs text-gray-400 bg-slate-700/50 px-2 py-1 rounded-full">
                              <TrendingUp className="h-3 w-3" />
                              <span>{child.questions_correct}/{child.questions_attempted}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="bg-transparent p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg mr-3 sm:mr-4">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-100">Topic Progress Analysis</h3>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              {selectedView === 'overview' 
                ? 'Quick overview of your topic performance' 
                : 'Detailed breakdown with progress metrics and subtopics'
              }
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('detailed')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                selectedView === 'detailed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Render appropriate view */}
      {selectedView === 'overview' ? <OverviewView /> : <DetailedView />}
    </motion.div>
  );
} 