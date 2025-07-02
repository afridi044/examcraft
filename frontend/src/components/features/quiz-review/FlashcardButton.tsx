import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";

interface FlashcardButtonProps {
  state: "idle" | "creating" | "created" | "exists";
  onClick: () => void;
}

const STATE_CONFIG = {
  idle: {
    className: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 border-0",
    icon: CreditCard,
    text: "Flashcard",
    title: "Create flashcard from this question",
  },
  creating: {
    className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 border-0 cursor-not-allowed",
    icon: null,
    text: "Creating...",
    title: "Creating flashcard...",
  },
  created: {
    className: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 border-0",
    icon: Check,
    text: "Created!",
    title: "Flashcard created successfully!",
  },
  exists: {
    className: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0",
    icon: Check,
    text: "Exists",
    title: "Flashcard already exists for this question",
  },
};

export function FlashcardButton({ state, onClick }: FlashcardButtonProps) {
  const config = STATE_CONFIG[state];
  const IconComponent = config.icon;

  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={state === "creating"}
      className={`relative overflow-hidden transition-all duration-300 font-medium text-xs sm:text-sm px-2 sm:px-3 ${config.className}`}
      title={config.title}
    >
      <div className="flex items-center space-x-1 sm:space-x-2">
        {state === "creating" ? (
          <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white/30 border-t-white rounded-full" />
        ) : IconComponent ? (
          <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : null}
        <span className="hidden sm:inline">{config.text}</span>
      </div>
    </Button>
  );
} 