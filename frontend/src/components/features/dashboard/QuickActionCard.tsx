import React from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  cardClass?: string;
  iconClass?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  href,
  onClick,
  cardClass = "",
  iconClass = "",
}) => {
  const { isDark } = useTheme();

  const cardContent = (
    <div className={`transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl rounded-xl border ${
      isDark 
        ? 'bg-gradient-to-br from-slate-800/60 to-slate-800/40 border-slate-700/60 hover:from-slate-800/80 hover:to-slate-800/60' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100'
    } ${cardClass}`}>
      <div className="p-3 sm:p-4 text-center">
        <div className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-opacity-30 transition-colors ${iconClass}`}>{icon}</div>
        <h3 className={`font-bold mb-1 text-xs sm:text-sm md:text-base ${
          isDark ? 'text-white' : 'text-blue-900'
        }`}>{title}</h3>
        <p className={`text-xs sm:text-sm ${
          isDark ? 'text-gray-300' : 'text-blue-700'
        }`}>{description}</p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}; 