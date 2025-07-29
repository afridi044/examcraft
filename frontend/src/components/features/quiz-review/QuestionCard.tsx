import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Target, Clock, CheckCircle, XCircle, Lightbulb, Brain } from "lucide-react";
import { FlashcardButton } from "./FlashcardButton";
import { AnswerOption } from "./AnswerOption";
import type { QuizReviewData } from "@/types";

interface QuestionCardProps {
  question: QuizReviewData["questions"][0];
  index: number;
  onCreateFlashcard: (questionId: string) => Promise<void>;
  formatTime: (seconds: number) => string;
  getDifficultyColor: (difficulty?: number) => string;
  getDifficultyLabel: (difficulty?: number) => string;
  isProcessing?: boolean;
}

export function QuestionCard({
  question,
  index,
  onCreateFlashcard,
  formatTime,
  getDifficultyColor,
  getDifficultyLabel,
  isProcessing = false,
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
      <Card className={`premium-glass shadow-xl rounded-xl px-5 sm:px-8 py-5 sm:py-5 transition-all duration-200 ${
        "bg-gradient-to-br from-slate-800/70 to-slate-900/80 border border-slate-600/60"
      }`}>
        {/* Question Header */}
        <div className="flex flex-row flex-wrap items-center justify-between mb-1 gap-2 sm:gap-3 mr-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`h-7 w-6 sm:h-7 sm:w-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${
              "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500"
            }`}>
              <span className={`font-bold text-sm ${
                "text-white"
              }`}>
                {index + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm sm:text-lg font-semibold mb-0.5 sm:mb-0.5 ${
                "text-white"
              }`}>
                Question {index + 1}
              </h3>
              <div className="flex flex-row flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-0.5 text-[0.7rem] sm:text-xs">
                <span className={getDifficultyColor(question.difficulty)}>
                  <Target className="h-3 w-3 inline mr-0.5" />
                  {getDifficultyLabel(question.difficulty)}
                </span>
                {question.user_answer?.time_taken_seconds && (
                  <span className={"text-gray-400"}>
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatTime(question.user_answer.time_taken_seconds)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-end gap-2 sm:gap-3 w-auto">
            {/* Flashcard Status Button */}
            <FlashcardButton
              questionId={question.question_id}
              exists={question.flashcard_exists}
              onCreateFlashcard={onCreateFlashcard}
              isProcessing={isProcessing}
            />
            {/* Correct/Incorrect Status */}
            <div className="flex items-center justify-end">
              {isCorrect ? (
                <CheckCircle className="h-10 w-10 text-green-500" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="mb-1">
          <p className={`text-lg sm:text-xl leading-snug font-medium ${
            "text-gray-200"
          }`}>
            {question.content}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-2 sm:space-y-2 mb-2 mt-1">
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
          <div className={`border-t pt-3 ${
            "border-gray-700/50"
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              <h4 className={`text-base sm:text-lg font-semibold ${
                "text-white"
              }`}>
                Explanation
              </h4>
              {question.explanation.ai_generated && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  <Brain className="h-3 w-3 inline mr-1" />
                  AI Generated
                </span>
              )}
            </div>
            <p className={`leading-relaxed p-2 sm:p-3 rounded-lg text-sm sm:text-base ${
              "text-gray-300 bg-gray-700/30"
            }`}>
              {question.explanation.content}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
} 