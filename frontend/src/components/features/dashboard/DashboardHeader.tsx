import React from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  iconLeft?: React.ReactNode; // Icon before the title
  iconAfterSubtitle?: React.ReactNode; // Icon after the subtitle
  children?: React.ReactNode; // For badges or extra content below subtitle
  rightContent?: React.ReactNode; // For button or custom content beside the title
  isDark?: boolean; // Theme mode
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  iconLeft,
  iconAfterSubtitle,
  children,
  rightContent,
  isDark = true,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-y-2 sm:gap-y-0 w-full">
    {/* Left: iconLeft, title, subtitle, iconAfterSubtitle, children */}
    <div className="w-full flex flex-col">
      <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
        {iconLeft && <span className="text-base sm:text-lg flex items-center">{iconLeft}</span>}
        <h1 className={`text-lg sm:text-2xl font-semibold tracking-tight ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {title}
        </h1>
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent ml-4"></div>
      </div>
      <div className="flex flex-row items-center w-full pl-0 sm:pl-0 mt-1" style={{marginLeft: iconLeft ? (iconLeft ? '2.25rem' : '0') : '0'}}>
        <p className={`text-xs sm:text-sm font-medium italic ${
          isDark ? 'text-slate-400' : 'text-gray-600'
        }`}>
          {subtitle}
        </p>
        {iconAfterSubtitle && <span className="text-base sm:text-lg ml-2 flex items-center">{iconAfterSubtitle}</span>}
      </div>
      {children && (
        <div className="flex justify-start mt-2 gap-2">{children}</div>
      )}
    </div>
    {/* Right: rightContent (button) in its own container */}
    {rightContent && (
      <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center justify-end">{rightContent}</div>
    )}
  </div>
); 