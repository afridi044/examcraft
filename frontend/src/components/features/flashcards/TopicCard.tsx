import { motion } from "framer-motion";
import { BookOpen, Hash, Play } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface TopicCardProps {
  topicId: string;
  topicName: string;
  count: number;
  progress: {
    learning: number;
    under_review: number;
    mastered: number;
    total: number;
  };
  isSelected: boolean;
  onClick: () => void;
  onStudy: () => void;
  index: number;
}

export function TopicCard({
  topicId,
  topicName,
  count,
  progress,
  isSelected,
  onClick,
  onStudy,
  index,
}: TopicCardProps) {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg p-6 cursor-pointer transition-all duration-300 group ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 group-hover:border-purple-400/40 transition-colors">
            <BookOpen className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isDark 
              ? 'bg-gray-700/50 text-gray-300 group-hover:bg-purple-500/20 group-hover:text-purple-300' 
              : 'bg-blue-100 text-blue-700 group-hover:bg-purple-100 group-hover:text-purple-700'
          }`}>
            <Hash className="h-4 w-4" />
            <span>{count}</span>
          </div>
        </div>

        <div>
          <h3 className={`font-semibold text-lg transition-colors mb-2 ${
            isDark 
              ? 'text-white group-hover:text-purple-300' 
              : 'text-blue-900 group-hover:text-purple-700'
          }`}>
            {topicName}
          </h3>
          <p className={`text-sm transition-colors mb-4 ${
            isDark 
              ? 'text-gray-400 group-hover:text-gray-300' 
              : 'text-blue-600 group-hover:text-purple-600'
          }`}>
            {count} flashcard{count !== 1 ? "s" : ""}
          </p>

          {/* Topic Progress */}
          <div className="mb-4 space-y-3">
            {/* Progress Bar */}
            <div className={`w-full rounded-full h-2 overflow-hidden ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-200'
            }`}>
              <div className="h-full flex">
                {progress.learning > 0 && (
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
                    style={{
                      width: `${(progress.learning / progress.total) * 100}%`,
                    }}
                  />
                )}
                {progress.under_review > 0 && (
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                    style={{
                      width: `${(progress.under_review / progress.total) * 100}%`,
                    }}
                  />
                )}
                {progress.mastered > 0 && (
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${(progress.mastered / progress.total) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Progress Stats */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                              <span className={`${
                isDark ? 'text-gray-400' : 'text-yellow-700'
              }`}>{progress.learning}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <span className={`${
                isDark ? 'text-gray-400' : 'text-blue-700'
              }`}>{progress.under_review}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
              <span className={`${
                isDark ? 'text-gray-400' : 'text-green-700'
              }`}>{progress.mastered}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onStudy();
            }}
            className={`w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
              isDark 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50' 
                : 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 text-purple-700 hover:from-purple-200 hover:to-blue-200 hover:border-purple-400'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="h-4 w-4" />
            Study Now
          </motion.button>
        </div>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
} 