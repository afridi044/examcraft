import { motion } from "framer-motion";
import { Trophy, Brain, Target, Star } from "lucide-react";
interface OverallProgressProps {
  progress: {
    learning: number;
    under_review: number;
    mastered: number;
    total: number;
  };
}

export function OverallProgress({ progress }: OverallProgressProps) {
  return (
    <motion.div
      className="mb-4 sm:mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className={`rounded-lg p-4 backdrop-blur-sm ${
        "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50"
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
            <Trophy className="h-4 w-4 text-purple-400" />
          </div>
          <h3 className={`text-base font-semibold ${
            "text-white"
          }`}>
            Overall Progress
          </h3>
          <div className={`ml-auto text-xs ${
            "text-gray-400"
          }`}>
            {progress.total} total flashcards
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            className="text-center p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-center mb-1">
              <Brain className="h-4 w-4 text-yellow-400 mr-1.5" />
              <span className="text-xl font-bold text-yellow-400">
                {progress.learning}
              </span>
            </div>
            <p className={`text-xs font-medium ${
              "text-gray-400"
            }`}>
              Learning
            </p>
            <p className={`text-xs mt-0.5 ${
              "text-gray-500"
            }`}>
              {progress.total > 0
                ? Math.round(
                    (progress.learning / progress.total) * 100
                  )
                : 0}
              %
            </p>
          </motion.div>

          <motion.div
            className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-blue-400 mr-1.5" />
              <span className="text-xl font-bold text-blue-400">
                {progress.under_review}
              </span>
            </div>
            <p className={`text-xs font-medium ${
              "text-gray-400"
            }`}>
              Under Review
            </p>
            <p className={`text-xs mt-0.5 ${
              "text-gray-500"
            }`}>
              {progress.total > 0
                ? Math.round(
                    (progress.under_review / progress.total) * 100
                  )
                : 0}
              %
            </p>
          </motion.div>

          <motion.div
            className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-green-400 mr-1.5" />
              <span className="text-xl font-bold text-green-400">
                {progress.mastered}
              </span>
            </div>
            <p className={`text-xs font-medium ${
              "text-gray-400"
            }`}>
              Mastered
            </p>
            <p className={`text-xs mt-0.5 ${
              "text-gray-500"
            }`}>
              {progress.total > 0
                ? Math.round(
                    (progress.mastered / progress.total) * 100
                  )
                : 0}
              %
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 