import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Filter as FilterIcon, Check } from "lucide-react";
import { createPortal } from "react-dom";

export interface FilterOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const MENU_WIDTH = 180;

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ options, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  // Position menu when open
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
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-2xl shadow-blue-900/20 overflow-hidden ring-1 ring-blue-400/10"
        >
          <div className="p-1">
            {options.map((opt) => {
              const Icon = opt.icon || FilterIcon;
              const selected = opt.id === selectedId;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                    selected
                      ? "bg-blue-600/30 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  } focus-visible:ring-2 focus-visible:ring-blue-400/40`}
                >
                  {selected ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
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
        className="flex items-center justify-center transition-all duration-300 rounded-lg h-8 w-8 p-0 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-slate-400 hover:text-slate-300"
      >
        <FilterIcon className="h-4 w-4" />
      </Button>
      {typeof window !== "undefined" && createPortal(menu, document.body)}
    </>
  );
}; 