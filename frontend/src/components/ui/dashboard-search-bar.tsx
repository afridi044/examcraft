import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";


interface DashboardSearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  /** Debounce delay in milliseconds */
  // debounceMs = 300, // currently unused
  /** Optional icon to show on the right side */
  rightIcon?: React.ReactNode;
  /** Optional click handler for the right icon */
  onRightIconClick?: () => void;
}

/**
 * Premium search bar component with animations and enhanced features
 * - Smooth hover and focus animations
 * - Clear button that appears when there's text
 * - Loading state with spinner
 * - Debounced input handling
 * - Optional right icon with click handler
 * - Fully responsive design
 */
export const DashboardSearchBar: React.FC<DashboardSearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  isLoading = false,
  // debounceMs = 300, // currently unused
  rightIcon,
  onRightIconClick,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  // Debounce logic removed for now

  // Handle clear button click
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      // If no onClear provided, simulate an empty input change
      onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div
      className={clsx(
        "group relative w-full transition-all duration-300",
        "rounded-lg",
        isFocused ? "ring-1 ring-blue-500/15" : "hover:ring-1 hover:ring-blue-100/10",
        className
      )}
    >
      {/* Search Icon with Animation */}
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.1 : 1,
          x: isFocused ? 2 : 0,
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-blue-400"
      >
        <Search className="h-4 w-4" />
      </motion.div>

      {/* Input Field */}
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx(
          "pl-10 pr-12",
          "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm border-blue-700/50 text-white placeholder-blue-300 focus:bg-blue-900/70 focus:border-blue-500/50 hover:bg-blue-900/60",
          "transition-colors duration-200",
          "focus:ring-blue-500/10",
          "focus:outline-none",
          "ring-0",
          "[&_::-webkit-search-cancel-button]:appearance-none"
        )}
      />

      {/* Right Side Icons Container */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
        {/* Clear Button */}
        <AnimatePresence>
          {value && !isLoading && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="transition-colors text-blue-300 hover:text-blue-200"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Loading Spinner */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-blue-400"
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional Right Icon */}
        <AnimatePresence>
          {rightIcon && !isLoading && (
            <motion.div
              key="right-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="focus:outline-none cursor-pointer text-blue-300 hover:text-blue-200"
              onClick={onRightIconClick}
            >
              {rightIcon}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 