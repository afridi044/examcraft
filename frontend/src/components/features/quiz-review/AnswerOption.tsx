import { CheckCircle, XCircle } from "lucide-react";
import type { QuizReviewData } from "@/types";

interface AnswerOptionProps {
  option: QuizReviewData["questions"][0]["question_options"][0];
  optionIndex: number;
  isUserSelected: boolean;
}

export function AnswerOption({ option, optionIndex, isUserSelected }: AnswerOptionProps) {
  const isCorrectOption = option.is_correct;

  // Determine styling based on option state
  const optionStyle = isCorrectOption
    ? "border-green-500 bg-green-500/20"
    : isUserSelected && !isCorrectOption
      ? "border-red-500 bg-red-500/20"
      : "border-gray-600 bg-gray-700/30";

  const textColor = isCorrectOption
    ? "text-green-300"
    : isUserSelected
      ? "text-red-300"
      : "text-gray-300";

  const borderColor = isCorrectOption
    ? "border-green-500"
    : isUserSelected
      ? "border-red-500"
      : "border-gray-500";

  return (
    <div className={`p-2.5 rounded-lg border ${optionStyle}`}>
      <div className="flex items-center space-x-2.5">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${borderColor}`}>
          {isCorrectOption ? (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          ) : isUserSelected ? (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <span className="text-gray-400 text-xs font-medium">
              {String.fromCharCode(65 + optionIndex)}
            </span>
          )}
        </div>
        <span className={`flex-1 ${textColor}`}>
          {option.content}
        </span>
        {isCorrectOption && (
          <span className="text-xs text-green-400 font-medium">
            Correct Answer
          </span>
        )}
        {isUserSelected && !isCorrectOption && (
          <span className="text-xs text-red-400 font-medium">
            Your Answer
          </span>
        )}
      </div>
    </div>
  );
} 