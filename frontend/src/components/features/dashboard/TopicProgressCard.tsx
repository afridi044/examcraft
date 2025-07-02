import { BarChart3 } from "lucide-react";
import type { TopicProgress } from "@/types";

interface TopicProgressCardProps {
  topic: TopicProgress;
}

export function TopicProgressCard({ topic }: TopicProgressCardProps) {
  return (
    <div className="group flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-600/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/70 transition-colors duration-200 flex-shrink-0">
          <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white group-hover:text-purple-300 transition-colors duration-200 text-sm sm:text-base truncate">
            {topic.topic_name}
          </p>
          <p className="text-xs text-gray-400 mb-1">
            {topic.questions_correct} of {topic.questions_attempted} questions correct
          </p>
          <div className="w-full bg-gray-600/30 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${topic.progress_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
          {topic.progress_percentage}%
        </span>
      </div>
    </div>
  );
} 