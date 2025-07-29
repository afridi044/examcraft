"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { useBackendDashboardStats } from "@/hooks/useBackendDashboard";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Target, 
  Brain, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
  BarChart3,
  Star,
  Flame,
  Zap,
  Trophy
} from "lucide-react";
import type { AuthUser } from "@/lib/services/auth.service";

interface ProfileStatsProps {
  user: AuthUser;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  progress?: number;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({ title, value, icon, description, progress, color, bgColor, borderColor, iconBgColor, iconColor }: StatCardProps) {
  return (
    <motion.div 
      className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${bgColor} ${borderColor}`}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <p className={`text-sm font-medium ${color}`}>{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
          <motion.div 
            className={`h-2 rounded-full ${iconBgColor.replace('bg-', 'bg-').replace('/20', '')}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const { data: stats, isLoading, error } = useBackendDashboardStats();
  const [memberSince, setMemberSince] = useState<string>('');

  useEffect(() => {
    if (user.created_at) {
      const date = new Date(user.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        setMemberSince('1 day');
      } else if (diffDays < 30) {
        setMemberSince(`${diffDays} days`);
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        setMemberSince(`${months} month${months > 1 ? 's' : ''}`);
      } else {
        const years = Math.floor(diffDays / 365);
        setMemberSince(`${years} year${years > 1 ? 's' : ''}`);
      }
    }
  }, [user.created_at]);

  if (isLoading) {
    return (
      <Card className="p-6 bg-slate-800/40 border-slate-700/60 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Learning Statistics
        </h3>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-slate-800/40 border-slate-700/60 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Learning Statistics
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400">Unable to load statistics</p>
        </div>
      </Card>
    );
  }

  const dashboardStats = stats || {
    totalQuizzes: 0,
    totalExams: 0,
    totalFlashcards: 0,
    averageScore: 0,
    studyStreak: 0,
    questionsAnswered: 0,
  };

  const statsCards = [
    {
      title: "Total Quizzes",
      value: dashboardStats.totalQuizzes,
      icon: <BarChart3 className="w-6 h-6" />,
      progress: Math.min(dashboardStats.totalQuizzes * 10, 100),
      color: "text-indigo-300",
      bgColor: "bg-indigo-600/20",
      borderColor: "border-indigo-500/30",
      iconBgColor: "bg-indigo-500/20",
      iconColor: "text-indigo-400"
    },
    {
      title: "Average Score",
      value: `${dashboardStats.averageScore.toFixed(1)}%`,
      icon: <Star className="w-6 h-6" />,
      progress: dashboardStats.averageScore,
      color: "text-emerald-300",
      bgColor: "bg-emerald-600/20",
      borderColor: "border-emerald-500/30",
      iconBgColor: "bg-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    {
      title: "Day Streak",
      value: dashboardStats.studyStreak,
      icon: <Flame className="w-6 h-6" />,
      progress: Math.min(dashboardStats.studyStreak * 10, 100),
      color: "text-orange-300",
      bgColor: "bg-orange-600/20",
      borderColor: "border-orange-500/30",
      iconBgColor: "bg-orange-500/20",
      iconColor: "text-orange-400"
    },
    {
      title: "Flashcards",
      value: dashboardStats.totalFlashcards,
      icon: <Brain className="w-6 h-6" />,
      progress: Math.min(dashboardStats.totalFlashcards * 5, 100),
      color: "text-purple-300",
      bgColor: "bg-purple-600/20",
      borderColor: "border-purple-500/30",
      iconBgColor: "bg-purple-500/20",
      iconColor: "text-purple-400"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Learning Statistics
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-full">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-medium text-slate-300">Member for {memberSince}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statsCards.map((card, index) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            progress={card.progress}
            color={card.color}
            bgColor={card.bgColor}
            borderColor={card.borderColor}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/* Achievement Section */}
      <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
        <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Recent Achievements
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "First Quiz", icon: <BookOpen className="w-4 h-4" />, unlocked: dashboardStats.totalQuizzes > 0 },
            { name: "Streak Master", icon: <Flame className="w-4 h-4" />, unlocked: dashboardStats.studyStreak >= 7 },
            { name: "High Scorer", icon: <Star className="w-4 h-4" />, unlocked: dashboardStats.averageScore >= 80 },
            { name: "Flashcard Pro", icon: <Brain className="w-4 h-4" />, unlocked: dashboardStats.totalFlashcards >= 10 }
          ].map((achievement) => (
            <motion.div 
              key={achievement.name}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg' 
                  : 'bg-slate-700/50 border border-slate-600/50'
              }`}>
                <div className={achievement.unlocked ? 'text-white' : 'text-gray-400'}>
                  {achievement.icon}
                </div>
              </div>
              <p className={`text-xs mt-2 font-medium ${
                achievement.unlocked ? 'text-yellow-300' : 'text-gray-400'
              }`}>
                {achievement.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 