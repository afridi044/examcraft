import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown } from "lucide-react";

export const SimpleDropdownButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 transition-all duration-300 rounded-xl h-10 px-3 group shadow-md ${
          isOpen
            ? "bg-gradient-to-br from-slate-700/90 to-slate-800/90 border-slate-600/80 text-white shadow-lg"
            : "bg-slate-800/60 hover:bg-slate-700/60 border-slate-700/60 text-slate-300 hover:text-white"
        } border`}
      >
        <div className="h-7 w-7 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md ring-2 ring-blue-400/20">
          <Menu className="h-4 w-4 text-white" />
        </div>
        <span className="hidden sm:block font-medium text-sm max-w-[120px] truncate">
          Menu
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 top-12 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-blue-900/20 z-50 overflow-hidden ring-1 ring-blue-400/10"
          >
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-indigo-500/10 rounded-xl transition-all duration-200 group">
                Option 1
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-indigo-500/10 rounded-xl transition-all duration-200 group">
                Option 2
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-indigo-500/10 rounded-xl transition-all duration-200 group">
                Option 3
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 