import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { QuizReviewData } from "@/types";

interface PerformanceSummaryProps {
  stats: QuizReviewData["quiz_stats"];
  formatTime: (seconds: number) => string;
}

export function PerformanceSummary({ stats, formatTime }: PerformanceSummaryProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 p-4 sm:p-6 lg:p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Performance Summary
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
            {stats.percentage}%
          </div>
          <div className="text-gray-400 text-sm">Overall Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
            {stats.correct_answers}/{stats.total_questions}
          </div>
          <div className="text-gray-400 text-sm">Correct Answers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">
            {stats.total_questions}
          </div>
          <div className="text-gray-400 text-sm">Total Questions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-2">
            {formatTime(stats.total_time)}
          </div>
          <div className="text-gray-400 text-sm">Total Time</div>
        </div>
      </div>
    </Card>
  );
} 