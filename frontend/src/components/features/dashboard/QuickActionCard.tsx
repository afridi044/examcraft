import React from "react";
import Link from "next/link";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  cardClass?: string;
  iconClass?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  href,
  cardClass = "",
  iconClass = "",
}) => (
  <Link href={href}>
    <div className={`bg-gradient-to-br from-slate-800/60 to-slate-800/40 border-slate-700/60 hover:from-slate-800/80 hover:to-slate-800/60 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl rounded-xl border ${cardClass}`}>
      <div className="p-3 sm:p-4 text-center">
        <div className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-opacity-30 transition-colors ${iconClass}`}>{icon}</div>
        <h3 className="font-bold text-white mb-1 text-xs sm:text-sm md:text-base">{title}</h3>
        <p className="text-gray-300 text-xs sm:text-sm">{description}</p>
      </div>
    </div>
  </Link>
); 