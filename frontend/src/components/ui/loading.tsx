import React from "react";
import { Loader2, BookOpen, Brain, Sparkles, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

// Types for loading components
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "purple" | "white" | "gray";
  className?: string;
}

export interface PageLoadingProps {
  title?: string;
  subtitle?: string;
  variant?: "default" | "auth" | "quiz" | "flashcard" | "dashboard";
  className?: string;
}

export interface ButtonLoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

// Consistent loading spinner component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const colorClasses = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    white: "text-white",
    gray: "text-gray-400",
  };

  return (
    <Loader2
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`}
    />
  );
};

// Consistent page loading component
export const PageLoading: React.FC<PageLoadingProps> = ({
  title = "Loading...",
  subtitle = "Please wait while we prepare your content",
  variant = "default",
  className = "",
}) => {
  const variants = {
    default: {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      gradient: "from-blue-500 to-purple-600",
      shadow: "shadow-blue-500/50",
    },
    auth: {
      icon: <BookOpen className="h-6 w-6 text-white" />,
      gradient: "from-blue-500 to-purple-600",
      shadow: "shadow-blue-500/50",
    },
    quiz: {
      icon: <Sparkles className="h-6 w-6 text-white" />,
      gradient: "from-purple-500 to-pink-600",
      shadow: "shadow-purple-500/50",
    },
    flashcard: {
      icon: <Brain className="h-6 w-6 text-white" />,
      gradient: "from-purple-500 to-pink-600",
      shadow: "shadow-purple-500/50",
    },
    dashboard: {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      gradient: "from-blue-500 to-purple-600",
      shadow: "shadow-blue-500/50",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6"
        >
          <div className={`h-16 w-16 bg-gradient-to-br ${currentVariant.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-2xl ${currentVariant.shadow}`}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              {currentVariant.icon}
            </motion.div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-br ${currentVariant.gradient.replace('500', '500/30').replace('600', '600/30')} rounded-2xl blur-xl`} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            {title}
          </h2>
          <p className="text-gray-400">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
};

// Consistent button loading component
export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  size = "md",
  text = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      </motion.div>
      <span>{text}</span>
    </div>
  );
};

// Auth-specific loading component
export const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ExamCraft</span>
          </div>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
        
        <div className="bg-gray-800/80 rounded-2xl border border-gray-700 shadow-xl p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-700/50 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-700/50 rounded-xl animate-pulse" />
            </div>
            <div className="h-12 bg-blue-600/50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple loading component for inline use
export const SimpleLoading: React.FC<{ text?: string; className?: string }> = ({
  text = "Loading...",
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <LoadingSpinner size="sm" color="blue" />
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
}; 