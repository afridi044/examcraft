import { motion } from "framer-motion";
import { BookOpen, Hash, Play } from "lucide-react";

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
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg p-4 cursor-pointer transition-all duration-300 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 group"
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
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 group-hover:border-purple-400/40 transition-colors">
            <BookOpen className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-700/50 text-xs font-medium text-gray-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
            <Hash className="h-3 w-3" />
            <span>{count}</span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-base text-white group-hover:text-purple-300 transition-colors mb-1">
            {topicName}
          </h3>
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mb-3">
            {count} flashcard{count !== 1 ? "s" : ""}
          </p>

          {/* Topic Progress */}
          <div className="mb-3 space-y-2">
            {/* Progress Bar */}
            <div className="w-full bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
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
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                <span className="text-gray-400">{progress.learning}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <span className="text-gray-400">{progress.under_review}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
                <span className="text-gray-400">{progress.mastered}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onStudy();
            }}
            className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-300 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="h-3.5 w-3.5" />
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