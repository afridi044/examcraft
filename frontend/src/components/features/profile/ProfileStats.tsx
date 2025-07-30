"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { useBackendDashboardStats } from "@/hooks/useBackendDashboard";
import { 
  BookOpen, 
  Target, 
  Brain, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
  BarChart3
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
  color: string;
}

function StatCard({ title, value, icon, description, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
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
      <Card className="p-6 bg-white/5 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Learning Statistics</h3>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white/5 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Learning Statistics</h3>
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
    correctAnswers: 0,
  };

  const accuracy = dashboardStats.questionsAnswered > 0 
    ? Math.round((dashboardStats.correctAnswers / dashboardStats.questionsAnswered) * 100)
    : 0;

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Learning Statistics</h3>
      
      <div className="space-y-4">
        {/* Member Since */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-400 font-medium">Member Since</p>
            <p className="text-xl font-bold text-white">{memberSince}</p>
          </div>
        </div>

        {/* Study Streak */}
        <StatCard
          title="Study Streak"
          value={dashboardStats.studyStreak}
          icon={<TrendingUp className="w-5 h-5 text-green-400" />}
          description="consecutive days"
          color="bg-green-500/20"
        />

        {/* Average Score */}
        <StatCard
          title="Average Score"
          value={`${Math.round(dashboardStats.averageScore)}%`}
          icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
          description="across all attempts"
          color="bg-blue-500/20"
        />

        {/* Questions Answered */}
        <StatCard
          title="Questions Answered"
          value={dashboardStats.questionsAnswered}
          icon={<Target className="w-5 h-5 text-purple-400" />}
          description="total attempts"
          color="bg-purple-500/20"
        />

        {/* Accuracy */}
        <StatCard
          title="Accuracy Rate"
          value={`${accuracy}%`}
          icon={<Award className="w-5 h-5 text-yellow-400" />}
          description={`${dashboardStats.correctAnswers} correct out of ${dashboardStats.questionsAnswered}`}
          color="bg-yellow-500/20"
        />

        {/* Content Created */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{dashboardStats.totalQuizzes}</p>
            <p className="text-xs text-gray-400">Quizzes</p>
          </div>
          
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{dashboardStats.totalExams}</p>
            <p className="text-xs text-gray-400">Exams</p>
          </div>
          
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <Brain className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">{dashboardStats.totalFlashcards}</p>
            <p className="text-xs text-gray-400">Flashcards</p>
          </div>
        </div>
      </div>
    </Card>
  );
} 