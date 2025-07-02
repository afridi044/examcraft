import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconShadowColor: string;
  borderHoverColor: string;
  shadowHoverColor: string;
  trendText?: string;
  href?: string;
  ariaLabel?: string;
}

export function StatCard({
  title,
  value,
  suffix = "",
  icon: Icon,
  iconBgColor,
  iconShadowColor,
  borderHoverColor,
  shadowHoverColor,
  trendText = "+12%",
  href,
  ariaLabel,
}: StatCardProps) {
  const cardContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className={`h-8 w-8 sm:h-10 sm:w-10 ${iconBgColor} rounded-lg flex items-center justify-center shadow-lg ${iconShadowColor}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {value.toLocaleString()}
            {suffix}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-1 text-xs">
        <TrendingUp className="h-3 w-3 text-emerald-400" />
        <span className="text-emerald-400 font-medium hidden sm:inline">
          {trendText}
        </span>
      </div>
    </div>
  );

  const cardClasses = `group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-${borderHoverColor} transition-all duration-200 hover:shadow-lg hover:shadow-${shadowHoverColor}`;

  if (href) {
    return (
      <div className={cardClasses}>
        <Link href={href} className="absolute inset-0 rounded-xl" aria-label={ariaLabel} />
        {cardContent}
      </div>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
} 