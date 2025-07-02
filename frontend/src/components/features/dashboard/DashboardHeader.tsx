import React from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  emoji?: React.ReactNode;
  children?: React.ReactNode; // For badges or extra content below subtitle
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  emoji,
  children,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-y-2 sm:gap-y-0">
    <div className="space-y-1 w-full">
      <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
        {/* Icon/Logo slot could go here if needed */}
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-100 tracking-tight">
          {title}
        </h1>
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent ml-4"></div>
      </div>
      <div className="flex flex-row items-center w-full">
        <p className="text-xs sm:text-sm text-slate-400 font-medium italic">
          {subtitle}
        </p>
        {emoji && <span className="text-base sm:text-lg ml-2">{emoji}</span>}
      </div>
      {children && (
        <div className="flex justify-start mt-2 gap-2">{children}</div>
      )}
    </div>
  </div>
); 