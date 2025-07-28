import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, RotateCcw, Loader2, MoreVertical } from "lucide-react";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useDeleteFlashcard } from "@/hooks/useBackendFlashcards";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface FlashCardProps {
  flashcard: any; // TODO: Define proper FlashcardWithTopic type
  index: number;
}

export function FlashCard({ flashcard, index }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { user: currentUser } = useBackendAuth();
  const deleteFlashcard = useDeleteFlashcard();

  // Calculate touch device once and memoize
  const [isTouchDevice] = useState(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!currentUser) {
      toast.error("Please log in to delete flashcards");
      return;
    }

    if (!confirm("Are you sure you want to delete this flashcard? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteFlashcard.mutateAsync(flashcard.flashcard_id);
      toast.success("Flashcard deleted successfully");
    } catch (error) {
      console.error("Delete flashcard error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete flashcard"
      );
    }
  }, [flashcard.flashcard_id, currentUser, deleteFlashcard]);

  // Calculate dynamic height based on current content (question or answer)
  const getContentLength = (text: string) => text.length;
  const currentContent = isFlipped ? flashcard.answer : flashcard.question;
  const currentContentLength = getContentLength(currentContent);

  // Default size (minimum size that card will never shrink below)
  const defaultHeight = "h-40 sm:h-44 md:h-48";

  // Dynamic height calculation - only grows larger, never shrinks below default
  const getDynamicHeight = () => {
    // If content is short (≤50 chars), use default size
    if (currentContentLength <= 50) return defaultHeight;

    // Only grow larger for longer content
    if (currentContentLength <= 100) return "h-48 sm:h-52 md:h-56"; // Medium content
    if (currentContentLength <= 200) return "h-56 sm:h-60 md:h-64"; // Long content
    if (currentContentLength <= 300) return "h-64 sm:h-68 md:h-72"; // Very long content
    return "h-72 sm:h-76 md:h-80"; // Extremely long content
  };

  // Dropdown menu
  const dropdownMenu = (
    <AnimatePresence>
      {dropdownOpen && (
        <motion.div
          ref={dropdownMenuRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{
            position: "absolute",
            top: 40,
            right: 8,
            width: 160,
            zIndex: 9999,
          }}
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl shadow-blue-900/20 overflow-hidden ring-1 ring-blue-400/10"
        >
          <div className="p-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                // TODO: Implement edit modal
                alert("Edit flashcard");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group text-blue-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/80 hover:to-blue-700/80 hover:shadow-lg hover:shadow-blue-700/20 focus-visible:ring-2 focus-visible:ring-blue-400/40"
            >
              <Pencil className="h-4 w-4 transition-colors duration-200 group-hover:text-white" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleDelete();
              }}
              disabled={deleteFlashcard.isPending}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/80 hover:to-red-700/80 hover:shadow-lg hover:shadow-red-700/20 focus-visible:ring-2 focus-visible:ring-blue-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteFlashcard.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin transition-colors duration-200 group-hover:text-white" />
              ) : (
                <Trash2 className="h-4 w-4 transition-colors duration-200 group-hover:text-white" />
              )}
              <span>{deleteFlashcard.isPending ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      className={`relative group w-full ${getDynamicHeight()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.05, boxShadow: "0 8px 32px 0 rgba(80, 80, 200, 0.18)" }}
    >
      {/* Status marker dot */}
      {flashcard.mastery_status && (
        <span
          className={`absolute top-2 left-2 w-3 h-3 rounded-full z-10
            ${flashcard.mastery_status === 'learning' ? 'bg-yellow-400' : ''}
            ${flashcard.mastery_status === 'under_review' ? 'bg-blue-400' : ''}
            ${flashcard.mastery_status === 'mastered' ? 'bg-green-400' : ''}
          `}
        />
      )}
      {/* Three-dot dropdown trigger */}
      <div className="absolute top-2 right-2 z-20">
        <Button
          ref={dropdownButtonRef}
          variant="ghost"
          size="icon"
          onClick={e => {
            e.stopPropagation();
            setDropdownOpen(v => !v);
          }}
          className={`h-8 w-8 p-0 flex items-center justify-center text-slate-400 hover:text-slate-300 hover:bg-slate-700/80 transition-all duration-200 ${dropdownOpen ? "bg-slate-700/90" : "bg-slate-800/60"}`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {dropdownMenu}
      </div>
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
          <motion.div
            className="absolute w-full h-full bg-gray-800/70 border border-gray-700 rounded-lg p-3 sm:p-4 transition-all shadow-lg overflow-hidden flex flex-col justify-center items-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p
              className="text-sm sm:text-base md:text-lg font-medium text-white text-center break-words px-2"
              style={{ lineHeight: '1.4' }}
            >
              {flashcard.question}
            </p>
            <AnimatePresence>
              <motion.div
                className="text-xs text-gray-400 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isTouchDevice ? "Tap to flip" : "Click to flip"}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Back side of the card */}
          <motion.div
            className="absolute w-full h-full bg-gray-800/70 border border-gray-700 rounded-lg p-3 sm:p-4 transition-all shadow-lg overflow-hidden flex flex-col justify-center items-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p
              className="text-sm sm:text-base text-gray-200 text-center break-words px-2"
              style={{ lineHeight: '1.4' }}
            >
              {flashcard.answer}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
} 