"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  X, 
  Lightbulb,
  Calendar,
  Award,
  Clock,
  BookOpen,
  Brain,
  Star,
  Zap
} from "lucide-react";

interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'tip';
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

interface ProgressInsightsProps {
  isOpen: boolean;
  onClose: () => void;
}

const dummyInsights: Insight[] = [
  {
    id: '1',
    type: 'positive',
    title: 'Streak Master!',
    description: 'You\'ve maintained a 7-day study streak. Your consistency is improving your retention.',
    icon: <TrendingUp className="w-5 h-5" />,
    action: 'Keep it up!'
  },
  {
    id: '2',
    type: 'tip',
    title: 'Study Optimization',
    description: 'Your best study time is between 9-11 AM. Try scheduling sessions during this window.',
    icon: <Lightbulb className="w-5 h-5" />,
    action: 'Schedule Session'
  },
  {
    id: '3',
    type: 'neutral',
    title: 'Chemistry Progress',
    description: 'You\'ve completed 68% of Chemistry topics. 12 more questions to master the subject.',
    icon: <Target className="w-5 h-5" />,
    action: 'Continue Learning'
  },
  {
    id: '4',
    type: 'negative',
    title: 'Flashcard Review',
    description: 'You have 15 flashcards due for review. Regular review improves long-term retention.',
    icon: <TrendingDown className="w-5 h-5" />,
    action: 'Review Now'
  },
  {
    id: '5',
    type: 'positive',
    title: 'Perfect Score!',
    description: 'You scored 100% on your last Mathematics quiz. Excellent work!',
    icon: <Star className="w-5 h-5" />,
    action: 'Celebrate!'
  }
];

const weeklyStats = {
  studyTime: 12.5, // hours
  quizzesCompleted: 8,
  flashcardsReviewed: 45,
  accuracyImprovement: 15, // percentage
  streakDays: 7,
  topicsMastered: 3
};

export function ProgressInsights({ isOpen, onClose }: ProgressInsightsProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'stats'>('insights');

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-500/30 bg-green-500/10';
      case 'negative':
        return 'border-red-500/30 bg-red-500/10';
      case 'tip':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'neutral':
        return 'border-gray-500/30 bg-gray-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      case 'tip':
        return 'text-blue-400';
      case 'neutral':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Progress Insights</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'insights' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Insights
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'stats' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Weekly Stats
              </button>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'insights' ? (
                <div className="p-4 space-y-3">
                  {dummyInsights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-1 ${getInsightIconColor(insight.type)}`}>
                          {insight.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-xs text-gray-300 mb-2">
                            {insight.description}
                          </p>
                          {insight.action && (
                            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                              {insight.action}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Weekly Overview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Study Time</span>
                      </div>
                      <div className="text-lg font-bold text-white">{weeklyStats.studyTime}h</div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400">Quizzes</span>
                      </div>
                      <div className="text-lg font-bold text-white">{weeklyStats.quizzesCompleted}</div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Flashcards</span>
                      </div>
                      <div className="text-lg font-bold text-white">{weeklyStats.flashcardsReviewed}</div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-gray-400">Accuracy</span>
                      </div>
                      <div className="text-lg font-bold text-white">+{weeklyStats.accuracyImprovement}%</div>
                    </div>
                  </div>

                  {/* Streak & Achievements */}
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-white">Current Streak</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{weeklyStats.streakDays} days</div>
                      <div className="text-xs text-gray-300">Keep the momentum going!</div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-white">Topics Mastered</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{weeklyStats.topicsMastered}</div>
                      <div className="text-xs text-gray-300">Excellent progress!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
              <Button
                onClick={onClose}
                className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 