import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BookOpen, CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface QuestionOption {
  option_id: string;
  content: string;
  is_correct: boolean;
}

interface Question {
  question_id: string;
  content: string;
  question_type: string;
  question_options?: QuestionOption[];
}

interface UserAnswer {
  question_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  time_taken_seconds: number;
}

interface QuizTakingQuestionCardProps {
  question: Question;
  questionIndex: number;
  userAnswer?: UserAnswer;
  onAnswerSelect: (optionId: string, textAnswer?: string) => void;
}

export function QuizTakingQuestionCard({
  question,
  questionIndex,
  userAnswer,
  onAnswerSelect,
}: QuizTakingQuestionCardProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-3 sm:p-4 ${
        isDark
          ? "bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-700/50"
          : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50"
      }`}>
        <div className="space-y-3 sm:space-y-4">
          {/* Question */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <h2 className={`text-base sm:text-lg font-bold ${
                isDark ? "text-white" : "text-blue-900"
              }`}>
                Question {questionIndex + 1}
              </h2>
            </div>
            <p className={`text-sm sm:text-base leading-normal ${
              isDark ? "text-gray-200" : "text-blue-800"
            }`}>
              {question.content}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-2">
            {question.question_type === "fill-in-blank" ? (
              <div className="space-y-1">
                <label className={`text-xs sm:text-sm ${
                  isDark ? "text-gray-300" : "text-blue-700"
                }`}>
                  Your Answer:
                </label>
                <input
                  type="text"
                  value={userAnswer?.text_answer || ""}
                  onChange={(e) => onAnswerSelect("", e.target.value)}
                  placeholder="Type your answer here..."
                  className={`w-full p-2 sm:p-3 border rounded-lg min-h-[40px] ${
                    isDark
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                      : "bg-white border-blue-300 text-blue-900 placeholder:text-blue-400"
                  }`}
                />
              </div>
            ) : (
              question.question_options?.map((option) => {
                const isSelected = userAnswer?.selected_option_id === option.option_id;
                return (
                  <button
                    key={option.option_id}
                    onClick={() => onAnswerSelect(option.option_id)}
                    className={`w-full p-2 sm:p-3 text-left rounded-lg border transition-all min-h-[44px] ${
                      isSelected
                        ? isDark
                          ? "border-purple-500 bg-purple-500/20 text-purple-300"
                          : "border-purple-500 bg-purple-100/50 text-purple-700"
                        : isDark
                          ? "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/70"
                          : "border-blue-300 bg-white text-blue-800 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500"
                            : isDark
                              ? "border-gray-500"
                              : "border-blue-400"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm">
                        {option.content}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
