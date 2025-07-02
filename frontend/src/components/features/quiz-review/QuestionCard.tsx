import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Target, Clock, CheckCircle, XCircle, Lightbulb, Brain } from "lucide-react";
import { FlashcardButton } from "./FlashcardButton";
import { AnswerOption } from "./AnswerOption";
import type { QuizReviewData } from "@/types";

interface QuestionCardProps {
  question: QuizReviewData["questions"][0];
  index: number;
  flashcardState: "idle" | "creating" | "created" | "exists";
  onGenerateFlashcard: (questionId: string) => void;
  formatTime: (seconds: number) => string;
  getDifficultyColor: (difficulty?: number) => string;
  getDifficultyLabel: (difficulty?: number) => string;
}

export function QuestionCard({
  question,
  index,
  flashcardState,
  onGenerateFlashcard,
  formatTime,
  getDifficultyColor,
  getDifficultyLabel,
}: QuestionCardProps) {
  const isCorrect = question.user_answer?.is_correct ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.05, 0.3),
        duration: 0.3,
      }}
    >
      <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-700/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {index + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Question {index + 1}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm space-y-1 sm:space-y-0">
                <span className={getDifficultyColor(question.difficulty)}>
                  <Target className="h-3 w-3 inline mr-1" />
                  {getDifficultyLabel(question.difficulty)}
                </span>
                {question.user_answer?.time_taken_seconds && (
                  <span className="text-gray-400">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatTime(question.user_answer.time_taken_seconds)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Flashcard Generation Button */}
            <FlashcardButton
              state={flashcardState}
              onClick={() => onGenerateFlashcard(question.question_id)}
            />

            {/* Correct/Incorrect Status */}
            <div className="flex items-center space-x-2">
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <span
                className={`font-medium ${isCorrect ? "text-green-400" : "text-red-400"}`}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="mb-6">
          <p className="text-gray-200 text-lg leading-relaxed">
            {question.content}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {question.question_options.map((option, optionIndex) => (
            <AnswerOption
              key={option.option_id}
              option={option}
              optionIndex={optionIndex}
              isUserSelected={option.option_id === question.user_answer?.selected_option_id}
            />
          ))}
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div className="border-t border-gray-700/50 pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              <h4 className="text-base sm:text-lg font-semibold text-white">
                Explanation
              </h4>
              {question.explanation.ai_generated && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  <Brain className="h-3 w-3 inline mr-1" />
                  AI Generated
                </span>
              )}
            </div>
            <p className="text-gray-300 leading-relaxed bg-gray-700/30 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
              {question.explanation.content}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
} 