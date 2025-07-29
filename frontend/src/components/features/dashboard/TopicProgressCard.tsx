import { BarChart3 } from "lucide-react";
import type { TopicProgress } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

interface TopicProgressCardProps {
  topic: TopicProgress;
}

export function TopicProgressCard({ topic }: TopicProgressCardProps) {
  const { isDark } = useTheme();
  return (
    <div className={`group flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-200 ${
      isDark 
        ? 'bg-gray-700/30 border border-gray-600/30 hover:bg-gray-700/50' 
        : 'bg-gray-100/80 border border-gray-300/60 hover:bg-gray-200/80'
    }`}>
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
          isDark 
            ? 'bg-gray-600/50 group-hover:bg-gray-600/70' 
            : 'bg-gray-200/80 group-hover:bg-gray-300/80'
        }`}>
          <div className={`transition-colors duration-200 ${
            isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-800'
          }`}>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium transition-colors duration-200 text-sm sm:text-base truncate ${
            isDark 
              ? 'text-white group-hover:text-purple-300' 
              : 'text-gray-900 group-hover:text-purple-600'
          }`}>
            {topic.topic_name}
          </p>
          <p className={`text-xs mb-1 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {topic.questions_correct} of {topic.questions_attempted} questions correct
          </p>
          <div className={`w-full rounded-full h-1.5 overflow-hidden ${
            isDark ? 'bg-gray-600/30' : 'bg-gray-300/60'
          }`}>
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${topic.progress_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
          isDark 
            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
            : 'bg-purple-500/20 text-purple-600 border-purple-500/30'
        }`}>
          {topic.progress_percentage}%
        </span>
      </div>
    </div>
  );
} 