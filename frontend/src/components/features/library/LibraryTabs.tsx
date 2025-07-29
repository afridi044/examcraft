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
    <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 p-2 shadow-lg">
      <div className="flex flex-col sm:flex-row gap-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center space-x-2 px-4 py-3 sm:px-4 sm:py-3 rounded-xl text-sm font-medium transition-all duration-300 flex-1 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 text-white backdrop-blur-md border border-blue-400/50 shadow-xl shadow-blue-500/20"
                : "text-gray-300 hover:text-gray-200 hover:bg-gray-700/40 hover:backdrop-blur-sm border border-transparent hover:border-gray-600/30"
            }`}
            whileHover={{ 
              scale: activeTab === tab.id ? 1.02 : 1.01,
              y: activeTab === tab.id ? -1 : 0
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg sm:text-xl">{tab.icon}</span>
            <span className="text-sm sm:text-base whitespace-nowrap font-semibold">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}; 