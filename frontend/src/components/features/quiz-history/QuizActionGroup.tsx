import { QuizActionButton } from "./QuizActionButton";
import { BookOpen, Play, Trash2, AlertCircle } from "lucide-react";
import type { QuizAttempt } from "@/types";

interface QuizActionGroupProps {
  attempt: QuizAttempt;
  onDelete: (quizId: string, title: string) => void;
  isDeleting: boolean;
}

const ACTION_CONFIG = {
  completed: [
    { variant: "review" as const, icon: BookOpen, href: (id: string) => `/quiz/review/${id}`, text: "Review" },
    { variant: "retake" as const, icon: Play, href: (id: string) => `/quiz/take/${id}`, text: "Retake" },
    { variant: "delete" as const, icon: Trash2, onClick: true, text: "Delete" },
  ],
  incomplete: [
    { variant: "continue" as const, icon: Play, href: (id: string) => `/quiz/take/${id}`, text: "Continue Quiz" },
    { variant: "delete" as const, icon: Trash2, onClick: true, text: "Delete" },
  ],
  not_attempted: [
    { variant: "start" as const, icon: Play, href: (id: string) => `/quiz/take/${id}`, text: "Start Quiz" },
    { variant: "delete" as const, icon: Trash2, onClick: true, text: "Delete" },
  ],
  empty: [
    { variant: "disabled" as const, icon: AlertCircle, text: "No Questions" },
    { variant: "delete" as const, icon: Trash2, onClick: true, text: "Delete" },
  ],
};

export function QuizActionGroup({ attempt, onDelete, isDeleting }: QuizActionGroupProps) {
  const config = ACTION_CONFIG[attempt.status] || [];
  const isDeletingThis = isDeleting;

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
      {config.map((action, index) => {
        if (action.onClick) {
          return (
            <QuizActionButton
              key={index}
              variant={action.variant}
              icon={action.icon}
              onClick={() => onDelete(attempt.quiz_id, attempt.title)}
              disabled={isDeletingThis}
              loading={isDeletingThis}
            >
              {isDeletingThis ? "Deleting..." : action.text}
            </QuizActionButton>
          );
        }

        return (
          <QuizActionButton
            key={index}
            variant={action.variant}
            icon={action.icon}
            href={action.href ? action.href(attempt.quiz_id) : undefined}
          >
            {action.text}
          </QuizActionButton>
        );
      })}
    </div>
  );
} 