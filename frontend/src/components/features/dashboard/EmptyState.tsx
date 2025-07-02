import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-6 sm:py-8">
      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
      </div>
      <p className="font-medium text-gray-300 mb-1 text-sm sm:text-base">
        {title}
      </p>
      <p className="text-xs sm:text-sm text-gray-400">
        {description}
      </p>
    </div>
  );
} 