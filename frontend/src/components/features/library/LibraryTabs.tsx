import React from "react";
import { motion } from "framer-motion";

interface LibraryTabsProps {
  activeTab: "notes" | "materials" | "books";
  onTabChange: (tab: "notes" | "materials" | "books") => void;
}

const tabs = [
  { id: "books", label: "Books", icon: "📚" },
  { id: "notes", label: "Study Notes", icon: "📖" },
  { id: "materials", label: "Study Materials", icon: "📋" },
] as const;

export const LibraryTabs: React.FC<LibraryTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 p-1">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex-1 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white backdrop-blur-sm border border-blue-400/30 shadow-lg"
                : "text-gray-300 hover:text-gray-200 hover:bg-gray-700/30 hover:backdrop-blur-sm"
            }`}
            whileHover={{ 
              scale: activeTab === tab.id ? 1.02 : 1.01,
              y: activeTab === tab.id ? -1 : 0
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-base sm:text-lg">{tab.icon}</span>
            <span className="text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}; 