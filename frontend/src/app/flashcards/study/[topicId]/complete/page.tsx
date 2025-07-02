"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Trophy,
  Target,
  RotateCcw,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface StudyCompletePageProps {
  params: Promise<{ topicId: string }>;
}

export default function StudyCompletePage({ params }: StudyCompletePageProps) {
  const router = useRouter();
  const [topicId, setTopicId] = useState<string>("");
  
  // Scroll to top when navigating
  useScrollToTop();

  // Get topic ID from params
  useEffect(() => {
    params.then((p) => setTopicId(p.topicId));
  }, [params]);

  const handleBackToTopics = () => {
    router.push("/flashcards");
  };

  const handleStudyAgain = () => {
    router.push(`/flashcards/study/${topicId}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="text-center max-w-md mx-auto px-4 sm:px-6 w-full">
          {/* Success Animation */}
          <motion.div
            className="relative mb-6 sm:mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
          >
            <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>

            {/* Celebration particles */}
            <motion.div
              className="absolute -top-2 -left-2 h-3 w-3 bg-yellow-400 rounded-full"
              animate={{
                y: [-10, -20, -10],
                x: [-5, 5, -5],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute -top-1 -right-3 h-2 w-2 bg-purple-400 rounded-full"
              animate={{
                y: [-15, -25, -15],
                x: [5, -5, 5],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.8,
              }}
            />
            <motion.div
              className="absolute -bottom-2 -right-1 h-2 w-2 bg-blue-400 rounded-full"
              animate={{
                y: [10, 20, 10],
                x: [-3, 3, -3],
                opacity: [1, 0.4, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1,
              }}
            />
          </motion.div>

          {/* Congratulations Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
              🎉 Study Session Complete!
            </h1>
            <p className="text-gray-400 text-base sm:text-lg px-2">
              Great job! You've completed your flashcard study session.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-xl p-3 sm:p-4">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-400">Session</p>
              <p className="text-lg sm:text-xl font-bold text-white">Completed</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-3 sm:p-4">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-400">Progress</p>
              <p className="text-lg sm:text-xl font-bold text-white">Updated</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              onClick={handleStudyAgain}
              className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 min-h-[48px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="h-5 w-5" />
              Study Again
            </motion.button>

            <motion.button
              onClick={handleBackToTopics}
              className="w-full px-6 py-3 sm:py-4 bg-gray-800/50 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-500/50 transition-all flex items-center justify-center gap-3 min-h-[48px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Topics
            </motion.button>
          </motion.div>

          {/* Motivational Message */}
          <motion.div
            className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-xs sm:text-sm text-gray-400">
              🧠 <strong className="text-purple-300">Spaced repetition</strong>{" "}
              helps you remember better. Your flashcards will appear again when
              you need to review them most!
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
