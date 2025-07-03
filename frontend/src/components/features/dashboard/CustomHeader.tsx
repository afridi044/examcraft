import React from "react";

interface CustomHeaderProps {
  title: string;
  subtitle: string;
  iconLeft?: React.ReactNode; // Icon before the title
  buttonText: string;
  buttonIcon?: React.ReactNode; // Icon for the button
  onButtonClick: () => void;
  buttonClassName?: string; // Custom button styling
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  subtitle,
  iconLeft,
  buttonText,
  buttonIcon,
  onButtonClick,
  buttonClassName = "px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center gap-2 hover:from-blue-800 hover:to-blue-900 transition-all text-sm font-semibold text-white",
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-y-2 sm:gap-y-0 w-full">
    {/* Left: iconLeft, title, subtitle */}
    <div className="w-full flex flex-col">
      <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
        {iconLeft && <span className="text-base sm:text-lg flex items-center">{iconLeft}</span>}
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-100 tracking-tight">
          {title}
        </h1>
        <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent ml-4"></div>
      </div>
      <div className="flex flex-row items-center w-full pl-0 sm:pl-0 mt-1" style={{marginLeft: iconLeft ? '2.25rem' : '0'}}>
        <p className="text-xs sm:text-sm text-slate-400 font-medium italic">
          {subtitle}
        </p>
      </div>
    </div>
    {/* Right: Button always positioned on the right */}
    <div className="mt-4 sm:mt-0 sm:ml-4 flex justify-center sm:justify-end items-center w-full sm:w-auto">
      <button
        onClick={onButtonClick}
        className={buttonClassName + ' whitespace-nowrap'}
      >
        {buttonIcon && buttonIcon}
        <span>{buttonText}</span>
      </button>
    </div>
  </div>
); 