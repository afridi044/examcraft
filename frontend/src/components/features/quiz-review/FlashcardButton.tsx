import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { useState } from "react";

interface FlashcardButtonProps {
  questionId: string;
  exists: boolean;
  isProcessing?: boolean;
  onCreateFlashcard: (questionId: string) => Promise<void>;
}

export function FlashcardButton({ questionId, exists, isProcessing = false, onCreateFlashcard }: FlashcardButtonProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleClick = async () => {
    if (exists || isCreating || isProcessing) return;
    
    setIsCreating(true);
    try {
      await onCreateFlashcard(questionId);
    } finally {
      setIsCreating(false);
    }
  };

  if (exists) {
    return (
      <Button
        size="sm"
        onClick={() => {}}
        className={`relative overflow-hidden rounded-full font-medium text-[0.7rem] sm:text-sm h-5 w-5 sm:h-10 sm:w-auto p-0 sm:px-5 ${
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-400/30"
        } cursor-not-allowed`}
        title="Flashcard exists for this question"
      >
        <div className="flex items-center justify-center sm:justify-start gap-0 sm:gap-2">
          <BookOpen className="h-6.5 w-6.5 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline font-semibold ml-2">Created</span>
        </div>
      </Button>
    );
  }

  if (isCreating || isProcessing) {
    return (
      <Button
        size="sm"
        disabled
        className={`relative overflow-hidden rounded-full font-medium text-[0.7rem] sm:text-sm h-5 w-5 sm:h-10 sm:w-auto p-0 sm:px-5 ${
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg backdrop-blur-sm border border-blue-400/30"
        } cursor-not-allowed opacity-80`}
        title="Creating flashcard..."
      >
        <div className="flex items-center justify-center sm:justify-start gap-0 sm:gap-2">
          <Loader2 className="h-6.5 w-6.5 sm:h-5 sm:w-5 animate-spin" />
          <span className="hidden sm:inline font-semibold ml-2">Creating...</span>
        </div>
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleClick}
      className={`relative overflow-hidden rounded-full font-medium text-[0.7rem] sm:text-sm h-5 w-5 sm:h-10 sm:w-auto p-0 sm:px-5 ${
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl backdrop-blur-sm border border-indigo-400/30"
      } hover:scale-105 transition-all duration-200`}
      title="Create flashcard from this question"
    >
      <div className="flex items-center justify-center sm:justify-start gap-0 sm:gap-2">
        <Plus className="h-6.5 w-6.5 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline font-semibold ml-2">Flashcard</span>
      </div>
    </Button>
  );
} 