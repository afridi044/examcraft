import React from "react";

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
  let scoreClass = "";
  if (typeof score === "number") {
    if (score >= 80) scoreClass = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
    else if (score >= 60) scoreClass = "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    else scoreClass = "bg-red-500/10 border border-red-500/20 text-red-400";
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
      <div className="h-7 w-7 sm:h-8 sm:w-8 bg-slate-600/40 border border-slate-500/40 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-gray-100 font-medium text-xs sm:text-sm truncate">{title}</h4>
        <p className="text-gray-400 text-xs mt-0.5">{date}</p>
      </div>
      {typeof score === "number" && (
        <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium ${scoreClass}`}>
          {score}%
        </div>
      )}
    </div>
  );
}; 