import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface RecentActivityItemProps {
  icon: React.ReactNode;
  title: string;
  date: string;
  score?: number;
}

export const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
  icon,
  title,
  date,
  score,
}) => {
  const { isDark } = useTheme();
  // Determine score class based on activity type and score
  let scoreClass = "";
  let showScore = false;
  
  if (typeof score === "number") {
    showScore = true;
    if (title.toLowerCase().includes('completed') && title.toLowerCase().includes('quiz')) {
      // Quiz completion scores
      if (score >= 80) scoreClass = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
      else if (score >= 60) scoreClass = "bg-amber-500/10 border border-amber-500/20 text-amber-400";
      else scoreClass = "bg-red-500/10 border border-red-500/20 text-red-400";
    } else {
      // Default for other activities
      scoreClass = "bg-slate-500/10 border border-slate-500/20 text-slate-400";
    }
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg transition-colors ${
      isDark 
        ? 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50' 
        : 'bg-gray-100/80 border border-gray-300/60 hover:bg-gray-200/80'
    }`}>
      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isDark 
          ? 'bg-slate-600/40 border border-slate-500/40' 
          : 'bg-gray-200/80 border border-gray-400/60'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-xs sm:text-sm truncate ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>{title}</h4>
        <p className={`text-xs mt-0.5 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>{date}</p>
      </div>
      {showScore && (
        <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium ${scoreClass}`}>
          {score}%
        </div>
      )}
    </div>
  );
}; 