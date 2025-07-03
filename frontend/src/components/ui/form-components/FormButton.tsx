"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FormButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  loadingIcon?: ReactNode;
  loadingText?: string;
  icon?: ReactNode;
  text: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export function FormButton({
  onClick,
  isLoading = false,
  disabled = false,
  loadingIcon,
  loadingText = "Processing...",
  icon,
  text,
  gradientFrom = "blue",
  gradientTo = "teal",
  className = ""
}: FormButtonProps) {
  // Map gradient colors to proper Tailwind classes
  const getGradientClasses = (from: string, to: string) => {
    const gradients: Record<string, string> = {
      'blue': 'from-blue-500 to-blue-600',
      'teal': 'from-teal-500 to-teal-600',
      'purple': 'from-purple-500 to-purple-600',
      'pink': 'from-pink-500 to-pink-600',
      'green': 'from-green-500 to-green-600',
      'emerald': 'from-emerald-500 to-emerald-600',
      'cyan': 'from-cyan-500 to-cyan-600',
      'orange': 'from-orange-500 to-orange-600',
      'red': 'from-red-500 to-red-600',
      'indigo': 'from-indigo-500 to-indigo-600',
    };
    
    const fromClass = gradients[from] || 'from-blue-500 to-blue-600';
    const toClass = gradients[to] || 'to-teal-500 to-teal-600';
    
    return `bg-gradient-to-r ${fromClass} hover:${fromClass.replace('500', '600')} hover:${toClass.replace('500', '600')}`;
  };

  const gradientClasses = getGradientClasses(gradientFrom, gradientTo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <Button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`w-full ${gradientClasses} text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-base sm:text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/25 ${className}`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                {loadingIcon}
              </motion.div>
              <span>{loadingText}</span>
            </motion.div>
          ) : (
            <motion.div 
              key="normal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                {icon}
              </motion.div>
              <span>{text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
