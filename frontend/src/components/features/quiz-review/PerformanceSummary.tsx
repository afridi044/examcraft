import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { QuizReviewData } from "@/types";

interface PerformanceSummaryProps {
  stats: QuizReviewData["quiz_stats"];
  formatTime: (seconds: number) => string;
}

export function PerformanceSummary({ stats, formatTime }: PerformanceSummaryProps) {
  return (
    <Card className="premium-glass bg-gradient-to-br from-slate-800/70 to-slate-900/80 border border-slate-600/60 shadow-2xl p-3 sm:p-4 rounded-2xl">
      {/* Heading Container */}
      <div className="flex flex-row items-center gap-4 ml-4 text-left">
        <Trophy className="h-5 w-5 text-yellow-400 drop-shadow" />
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Performance Summary
        </h2>
      </div>
      {/* Stats Container */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 justify-items-center">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">
            {stats.percentage}%
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Overall Score</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">
            {stats.correct_answers}/{stats.total_questions}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Correct Answers</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">
            {stats.total_questions}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Total Questions</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-orange-400 mb-1">
            {formatTime(stats.total_time)}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm">Total Time</div>
        </div>
      </div>
    </Card>
  );
} 