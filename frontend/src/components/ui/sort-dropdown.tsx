import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ArrowDownWideNarrow, ArrowUpWideNarrow, Calendar, Trophy } from "lucide-react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";

export interface SortOption {
  id: string; // e.g., "date_desc"
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SortDropdownProps {
  options: SortOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const MENU_WIDTH = 220;

export const SortDropdown: React.FC<SortDropdownProps> = ({ options, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  const menu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH, zIndex: 9999 }}
          className={`backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden ring-1 ${
            isDark
              ? "bg-slate-900/95 border-slate-700/60 shadow-blue-900/20 ring-blue-400/10"
              : "bg-white/95 border-blue-200/60 shadow-blue-900/10 ring-blue-400/10"
          }`}
        >
          <div className="p-1">
            {options.map((opt) => {
              const Icon = opt.icon || ArrowUpDown;
              const selected = opt.id === selectedId;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                    selected
                      ? isDark
                        ? "bg-blue-600/30 text-white"
                        : "bg-blue-100 text-blue-700"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                  } focus-visible:ring-2 focus-visible:ring-blue-400/40`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{opt.label}</span>
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
        className={`flex items-center justify-center transition-all duration-300 rounded-lg h-8 w-8 p-0 ${
          isDark
            ? "bg-gradient-to-r from-blue-800/60 to-indigo-800/60 hover:from-blue-700/80 hover:to-indigo-700/80 border border-blue-700/60 text-blue-300 hover:text-blue-200"
            : "bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border border-blue-300/60 text-blue-700 hover:text-blue-800"
        }`}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
      {typeof window !== "undefined" && createPortal(menu, document.body)}
    </>
  );
}; 