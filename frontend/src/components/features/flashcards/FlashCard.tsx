import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, RotateCcw, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useDatabase";
import { useDeleteFlashcard } from "@/hooks/useBackendFlashcards";
import { toast } from "react-hot-toast";
import type { FlashcardWithTopic } from "@/types";

interface FlashCardProps {
  flashcard: FlashcardWithTopic;
  index: number;
}

export function FlashCard({ flashcard, index }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const deleteFlashcard = useDeleteFlashcard();

  // Calculate touch device once and memoize
  const [isTouchDevice] = useState(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!currentUser?.user_id) {
      toast.error("Please log in to delete flashcards");
      return;
    }

    if (!confirm("Are you sure you want to delete this flashcard? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteFlashcard.mutateAsync({
        flashcardId: flashcard.flashcard_id,
        userId: currentUser.user_id,
      });
      toast.success("Flashcard deleted successfully");
    } catch (error) {
      console.error("Delete flashcard error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete flashcard"
      );
    }
  }, [flashcard.flashcard_id, currentUser?.user_id, deleteFlashcard]);

  return (
    <motion.div
      className="relative group w-full h-40 sm:h-44 md:h-48"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.1,
      }}
      onHoverStart={() => !isTouchDevice && setIsHovered(true)}
      onHoverEnd={() => !isTouchDevice && setIsHovered(false)}
      onTouchStart={() => isTouchDevice && setIsHovered(true)}
      onTouchEnd={() =>
        isTouchDevice && setTimeout(() => setIsHovered(false), 1000)
      }
      whileHover={{ scale: 1.02 }}
    >
      <div
        className="relative w-full h-full cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <motion.div
          className="absolute w-full h-full backface-hidden rounded-lg preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front side of the card */}
          <div
            className={`absolute w-full h-full bg-gray-800/70 border border-gray-700 rounded-lg p-3 sm:p-4 flex flex-col justify-center items-center transition-all shadow-lg ${
              isHovered && !isFlipped ? "shadow-blue-500/30" : "shadow-black/20"
            }`}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <motion.p
              className="text-sm sm:text-base md:text-lg font-medium text-white text-center"
              animate={{ scale: isHovered && !isFlipped ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {flashcard.question}
            </motion.p>

            {/* Hint for desktop */}
            <motion.div
              className="absolute bottom-2 sm:bottom-3 text-xs text-gray-400 hidden md:block"
              animate={{ opacity: isHovered && !isFlipped ? 1 : 0 }}
              initial={{ opacity: 0 }}
            >
              Click to flip
            </motion.div>

            {/* Hint for mobile */}
            <motion.div
              className="absolute bottom-2 text-xs text-gray-400 block md:hidden"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0.3, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Tap to flip
            </motion.div>
          </div>

          {/* Back side of the card */}
          <div
            className={`absolute w-full h-full bg-gray-800/70 border border-gray-700 rounded-lg p-3 sm:p-4 flex flex-col justify-center items-center transition-all shadow-lg ${
              isHovered && isFlipped
                ? "shadow-purple-500/30"
                : "shadow-black/20"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <motion.p
              className="text-sm sm:text-base text-gray-200 text-center"
              animate={{ scale: isHovered && isFlipped ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {flashcard.answer}
            </motion.p>

            {/* Hint for desktop */}
            <motion.div
              className="absolute bottom-2 sm:bottom-3 text-xs text-gray-400 hidden md:block"
              animate={{ opacity: isHovered && isFlipped ? 1 : 0 }}
              initial={{ opacity: 0 }}
            >
              Click to flip back
            </motion.div>

            {/* Hint for mobile */}
            <motion.div
              className="absolute bottom-2 text-xs text-gray-400 block md:hidden"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0.3, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Tap to flip back
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Topic info */}
      <div
        className="absolute bottom-0 left-0 right-0 mt-3 px-2 sm:px-3 py-1.5 sm:py-2 border-t border-gray-700 flex justify-between items-center bg-gray-800/90 rounded-b-lg z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-gray-400 truncate max-w-[70%]">
          {flashcard.topic?.name || "General"}
        </span>
        <motion.div
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <RotateCcw
            size={14}
            className="text-blue-400 opacity-60 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
          />
        </motion.div>
      </div>

      {/* Action buttons (visible on hover/touch) */}
      <motion.div
        className="absolute top-1.5 right-1.5 flex gap-1 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Edit button */}
        <motion.button
          className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement edit functionality
            toast.info("Edit functionality coming soon!");
          }}
        >
          <Pencil size={12} />
        </motion.button>

        {/* Delete button */}
        <motion.button
          className="p-1.5 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 hover:border-red-400/50 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={deleteFlashcard.isPending}
        >
          {deleteFlashcard.isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
} 