import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, BookOpen, Play, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { QuizAttempt } from "@/types";
import { createPortal } from "react-dom";

interface QuizActionsDropdownProps {
  attempt: QuizAttempt;
  onDelete: (quizId: string, title: string) => void;
  isDeleting: boolean;
}

const ACTION_CONFIG = {
  completed: [
    { 
      id: "review", 
      icon: BookOpen, 
      label: "Review Answers", 
      href: (id: string) => `/quiz/review/${id}`,
      className: "text-blue-400 hover:text-blue-300"
    },
    { 
      id: "retake", 
      icon: Play, 
      label: "Retake Quiz", 
      href: (id: string) => `/quiz/take/${id}`,
      className: "text-green-400 hover:text-green-300"
    },
    { 
      id: "delete", 
      icon: Trash2, 
      label: "Delete Quiz", 
      onClick: true,
      className: "text-red-400 hover:text-red-300"
    },
  ],
  not_taken: [
    { 
      id: "start", 
      icon: Play, 
      label: "Start Quiz", 
      href: (id: string) => `/quiz/take/${id}`,
      className: "text-green-400 hover:text-green-300"
    },
    { 
      id: "delete", 
      icon: Trash2, 
      label: "Delete Quiz", 
      onClick: true,
      className: "text-red-400 hover:text-red-300"
    },
  ],
  // Fallback for any other status
  default: [
    { 
      id: "start", 
      icon: Play, 
      label: "Start Quiz", 
      href: (id: string) => `/quiz/take/${id}`,
      className: "text-green-400 hover:text-green-300"
    },
    { 
      id: "delete", 
      icon: Trash2, 
      label: "Delete Quiz", 
      onClick: true,
      className: "text-red-400 hover:text-red-300"
    },
  ],
};

export const QuizActionsDropdown: React.FC<QuizActionsDropdownProps> = ({ 
  attempt, 
  onDelete, 
  isDeleting 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debug: Log the status to see what we're getting
  console.log('QuizActionsDropdown - attempt status:', attempt.status);

  // Map old status values to new ones for backward compatibility
  const getNormalizedStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "completed";
      case "not_taken":
        return "not_taken";
      default:
        return "not_taken";
    }
  };

  const normalizedStatus = getNormalizedStatus(attempt.status);
  const actions = ACTION_CONFIG[normalizedStatus] || ACTION_CONFIG.default || [];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Position the menu when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 6, // 6px gap
        left: rect.right + window.scrollX - 192, // 192px = menu width
        width: rect.width,
      });
    }
  }, [isOpen]);

  const handleAction = (action: typeof actions[0]) => {
    if ("disabled" in action && action.disabled) return;
    
    if (action.onClick) {
      onDelete(attempt.quiz_id, attempt.title);
    } else if ("href" in action && typeof action.href === 'function') {
      router.push(action.href(attempt.quiz_id));
    }
    setIsOpen(false);
  };

  // The dropdown menu
  const menu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{
            position: "absolute",
            top: menuPosition.top,
            left: menuPosition.left,
            width: 192,
            zIndex: 9999,
          }}
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl shadow-blue-900/20 overflow-hidden ring-1 ring-blue-400/10"
        >
          <div className="p-1">
            {actions.map((action) => {
              const Icon = action.icon;
              const isDeleteAction = action.id === "delete" && isDeleting;
              
              // Get matching hover gradient based on action type
              const getHoverStyle = (actionId: string) => {
                switch (actionId) {
                  case "review":
                    return "hover:bg-gradient-to-r hover:from-blue-600/80 hover:to-blue-700/80 hover:shadow-blue-700/20";
                  case "retake":
                  case "continue":
                  case "start":
                    return "hover:bg-gradient-to-r hover:from-green-600/80 hover:to-green-700/80 hover:shadow-green-700/20";
                  case "delete":
                    return "hover:bg-gradient-to-r hover:from-red-600/80 hover:to-red-700/80 hover:shadow-red-700/20";
                  default:
                    return "hover:bg-slate-800/60";
                }
              };
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  disabled={("disabled" in action && action.disabled) || isDeleteAction}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                    ("disabled" in action && action.disabled) || isDeleteAction
                      ? "text-slate-500 cursor-not-allowed"
                      : `${action.className} hover:text-white hover:shadow-lg ${getHoverStyle(action.id)} focus-visible:ring-2 focus-visible:ring-blue-400/40`
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-colors duration-200 ${
                    ("disabled" in action && action.disabled) || isDeleteAction ? "" : "group-hover:text-white"
                  }`} />
                  <span>
                    {isDeleteAction ? "Deleting..." : action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDeleting}
        className={`flex items-center justify-center transition-all duration-300 rounded-lg h-8 w-8 p-0 group ${
          isOpen
            ? "bg-slate-700/90 border-slate-600/80 text-slate-300"
            : "bg-slate-800/60 hover:bg-slate-700/80 border-slate-700/60 text-slate-400 hover:text-slate-300"
        } border`}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {typeof window !== "undefined" && createPortal(menu, document.body)}
    </>
  );
}; 