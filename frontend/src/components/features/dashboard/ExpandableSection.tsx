import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";

interface ExpandableSectionProps {
  title: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconShadowColor: string;
  gradientFrom: string;
  gradientTo: string;
  showExpandButton: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function ExpandableSection({
  title,
  icon: Icon,
  iconBgColor,
  iconShadowColor,
  gradientFrom,
  gradientTo,
  showExpandButton,
  isExpanded,
  onToggle,
  children,
}: ExpandableSectionProps) {
  return (
    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg shadow-black/10 overflow-hidden">
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-3 sm:p-4 border-b border-gray-700/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`h-6 w-6 sm:h-8 sm:w-8 ${iconBgColor} rounded-lg flex items-center justify-center shadow-lg ${iconShadowColor}`}>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {title}
            </h2>
          </div>
          {showExpandButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 px-2 sm:px-3"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Show Less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">View All</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
} 