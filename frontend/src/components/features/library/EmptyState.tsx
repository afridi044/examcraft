import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}) => {
  return (
    <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-6 sm:p-8">
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl sm:text-3xl">{icon}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          {title}
        </h3>
        <p className="text-gray-400 text-sm sm:text-base">
          {description}
        </p>
        <div className="flex justify-center">
          <Link href={actionHref}>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {actionLabel}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}; 