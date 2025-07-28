import React from "react";
import { Card } from "@/components/ui/card";
import { QuizActionsDropdown } from "./QuizActionsDropdown";
import {
  Calendar,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CircleDot,
  Pause,
  BookOpen,
} from "lucide-react";
  import { formatDate, getStatusBadge, getStatusIconConfig, getScoreColors, formatQuizTime } from "@/lib/utils/quiz-history";
import type { QuizAttempt } from "@/types";



interface QuizAttemptCardProps {
  attempt: QuizAttempt;
  onDelete: (quizId: string) => void;
  isDeleting: boolean;
}

export const QuizAttemptCard: React.FC<QuizAttemptCardProps> = ({ attempt, onDelete, isDeleting }) => {
  const statusIconConfig = getStatusIconConfig(attempt.status);
  const scoreColors = attempt.status === "completed" ? getScoreColors(attempt.score_percentage) : null;

  const renderStatusIcon = () => {
    switch (statusIconConfig.icon) {
      case "CheckCircle":
        return <CheckCircle className={statusIconConfig.className} />;
      case "Pause":
        return <Pause className={statusIconConfig.className} />;
      case "CircleDot":
        return <CircleDot className={statusIconConfig.className} />;
      case "AlertCircle":
        return <AlertCircle className={statusIconConfig.className} />;
      default:
        return <CircleDot className={statusIconConfig.className} />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-slate-700/50 p-3 sm:p-4 hover:shadow-lg hover:shadow-blue-500/10 hover:border-slate-600/60 transition-all duration-300 group overflow-visible">
      <div className="flex items-start">
        {/* Left Container - Title, Badge, Topic, Date */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title and Badge */}
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">
              {attempt.title}
            </h3>
            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium border self-start ${getStatusBadge(attempt.status)}`}>
              {renderStatusIcon()}
              <span className="ml-1 sm:ml-1.5 capitalize">
                {attempt.status.replace("_", " ")}
              </span>
            </span>
          </div>

          {/* Topic and Date */}
          <div className="space-y-2">
            {attempt.topic_name && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-400">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{attempt.topic_name}</span>
              </div>
            )}
            
            {/* Date */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">
                {attempt.completed_at
                  ? formatDate(attempt.completed_at)
                  : formatDate(attempt.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Container - Score and Stats */}
        <div className="flex flex-col items-end mr-3 sm:mr-6">
          {/* Score */}
          <div className="text-right">
            {attempt.status === "completed" && scoreColors ? (
              <div className={`text-lg sm:text-2xl font-bold ${scoreColors.text}`}>
                {attempt.score_percentage.toFixed(0)}%
              </div>
            ) : attempt.status === "incomplete" ? (
              <div className="text-base sm:text-xl font-bold text-amber-400">
                {Math.round(((attempt.answered_questions || 0) / attempt.total_questions) * 100)}%
              </div>
            ) : (
              <div className="text-base sm:text-xl font-bold text-slate-500">
                --
              </div>
            )}
            <div className="text-xs text-slate-400 mt-0.5">
              {attempt.status === "completed" 
                ? (attempt.score_percentage >= 70 ? "Passed" : "Failed")
                : attempt.status === "incomplete"
                ? "In Progress"
                : "Not Started"}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-2 sm:space-x-3 mt-[26px] text-xs sm:text-sm text-slate-400">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                {attempt.status === "incomplete" && attempt.answered_questions
                  ? `${attempt.answered_questions}/${attempt.total_questions}`
                  : `${attempt.correct_answers}/${attempt.total_questions}`}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                {formatQuizTime(attempt.time_spent_minutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Container - Actions */}
        <div className="flex ml-2 sm:ml-0">
          <QuizActionsDropdown
            attempt={attempt}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </Card>
  );
}; 