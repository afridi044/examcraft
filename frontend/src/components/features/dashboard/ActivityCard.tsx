import { LucideIcon } from "lucide-react";
import type { RecentActivity } from "@/types";

interface ActivityCardProps {
  activity: RecentActivity;
  icon: LucideIcon;
  formatDate: (dateString: string) => string;
}

export function ActivityCard({ activity, icon: Icon, formatDate }: ActivityCardProps) {
  return (
    <div className="group flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-600/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/70 transition-colors duration-200 flex-shrink-0">
          <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white group-hover:text-blue-300 transition-colors duration-200 text-sm sm:text-base truncate">
            {activity.title}
          </p>
          <p className="text-xs text-gray-400">
            <span className="capitalize">{activity.type}</span>
            <span className="hidden sm:inline">
              {" "}
              • {formatDate(activity.completed_at)}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        {activity.score !== undefined && (
          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
            {activity.score}%
          </span>
        )}
      </div>
    </div>
  );
} 