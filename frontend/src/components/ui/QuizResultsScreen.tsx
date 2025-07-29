"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Trophy, Star, CheckCircle, Target, Clock, BookOpen, Brain, ArrowRight, XCircle } from "lucide-react";
import { ReactNode } from "react";

export interface QuizResultsScreenProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: string;
  isTimed?: boolean;
  timeLimitMinutes?: number;
  wasAutoSubmitted?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  showConfetti?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return { gradient: "from-green-500 to-emerald-500", text: "from-green-400 to-emerald-400", glow: "from-green-400 to-emerald-400", shadow: "shadow-green-500/30", border: "border-green-400/30" };
  if (score >= 80) return { gradient: "from-green-500 to-teal-500", text: "from-green-400 to-teal-400", glow: "from-green-400 to-teal-400", shadow: "shadow-green-500/30", border: "border-green-400/30" };
  if (score >= 70) return { gradient: "from-green-500 to-cyan-500", text: "from-green-400 to-cyan-400", glow: "from-green-400 to-cyan-400", shadow: "shadow-green-500/30", border: "border-green-400/30" };
  if (score >= 60) return { gradient: "from-yellow-500 to-green-500", text: "from-yellow-400 to-green-400", glow: "from-yellow-400 to-green-400", shadow: "shadow-yellow-500/30", border: "border-yellow-400/30" };
  return { gradient: "from-orange-500 to-yellow-500", text: "from-orange-400 to-yellow-400", glow: "from-orange-400 to-yellow-400", shadow: "shadow-orange-500/30", border: "border-orange-400/30" };
};

export function QuizResultsScreen({
  score,
  correctAnswers,
  totalQuestions,
  timeTaken,
  isTimed = false,
  timeLimitMinutes,
  wasAutoSubmitted = false,
  primaryAction,
  secondaryActions = [],
  showConfetti = false
}: QuizResultsScreenProps) {
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const colors = getScoreColor(score);

  return (
    <div className="relative">
      <div className="relative z-10 max-w-2xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4 sm:space-y-6"
        >
          {/* Trophy Icon */}
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              {/* Main icon container */}
              <div className={`relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-xl ${colors.shadow} border-2 ${colors.border}`}>
                <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white drop-shadow-lg" />
              </div>

              {/* Floating particles */}
              <motion.div
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-2 w-2 sm:h-3 sm:w-3 bg-yellow-400 rounded-full"
                animate={{
                  y: [-3, -8, -3],
                  x: [-2, 2, -2],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-400 rounded-full"
                animate={{
                  y: [-2, -6, -2],
                  x: [-1, 1, -1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className={`bg-gradient-to-r ${colors.text} bg-clip-text text-transparent`}>
                Quiz Completed!
              </span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Hero Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={headerInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.98 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="text-center space-y-3 sm:space-y-4">
            {/* Large Score Display */}
            <motion.div
              className={`text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r ${colors.text} bg-clip-text text-transparent`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
            >
              {score}%
            </motion.div>
          </div>
        </motion.div>

        {/* Key Stats Row */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 max-w-full">
            <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-2 sm:px-4 rounded-lg border border-gray-700/50">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              <span className="text-sm sm:text-lg font-bold text-yellow-400">{totalQuestions}</span>
              <span className="text-xs sm:text-sm text-gray-300">total</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-2 sm:px-4 rounded-lg border border-gray-700/50">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              <span className="text-sm sm:text-lg font-bold text-green-400">{correctAnswers}</span>
              <span className="text-xs sm:text-sm text-gray-300">correct</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-2 sm:px-4 rounded-lg border border-gray-700/50">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              <span className="text-sm sm:text-lg font-bold text-red-400">{totalQuestions - correctAnswers}</span>
              <span className="text-xs sm:text-sm text-gray-300">incorrect</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-2 sm:px-4 rounded-lg border border-gray-700/50">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
              <span className="text-sm sm:text-lg font-bold text-orange-400">{timeTaken}</span>
              <span className="text-xs sm:text-sm text-gray-300">time</span>
            </div>
          </div>
        </motion.div>

        {/* Auto-submit notification */}
        {wasAutoSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="flex justify-center"
          >
            <div className="flex items-center space-x-2 bg-orange-500/20 px-4 py-3 rounded-lg border border-orange-500/30">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">
                Quiz was auto-submitted when time expired
              </span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {(primaryAction || secondaryActions.length > 0) && (
          <motion.div
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            {/* Primary Action Button */}
            {primaryAction && (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={primaryAction.onClick}
                  className={`w-full relative overflow-hidden bg-gradient-to-r ${colors.gradient} hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg min-h-[48px] sm:min-h-[56px] shadow-lg hover:shadow-green-500/25 transition-all duration-300 border-0 group`}
                >
                  {/* Button content */}
                  <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                    {primaryAction.icon || <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />}
                    <span className="font-semibold text-base sm:text-lg">{primaryAction.label}</span>
                  </div>
                </Button>
              </motion.div>
            )}

            {/* Secondary Action Buttons */}
            {secondaryActions.length > 0 && (
              <div className={`grid gap-3 ${secondaryActions.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {secondaryActions.map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={action.onClick}
                      variant="outline"
                      className="w-full relative overflow-hidden border border-gray-600/50 bg-gray-800/50 text-gray-200 hover:bg-gray-700/50 hover:border-gray-500/50 hover:text-white py-2.5 sm:py-3 min-h-[44px] sm:min-h-[48px] transition-all duration-300 group text-sm sm:text-base"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {action.icon || <Brain className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-200" />}
                        <span className="font-medium">{action.label}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 