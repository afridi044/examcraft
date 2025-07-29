import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid3X3, List, Filter, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface NotesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  topics: string[];
  totalNotes: number;
  filteredNotes: number;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedTopic,
  onTopicChange,
  topics,
  totalNotes,
  filteredNotes,
}) => {
  return (
    <div className="space-y-6">
      {/* Premium Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-gradient-to-r from-slate-800/80 via-slate-800/90 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          {/* Title and Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Study Notes
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base mt-1">
                    {filteredNotes === totalNotes 
                      ? `${totalNotes} note${totalNotes !== 1 ? 's' : ''}`
                      : `${filteredNotes} of ${totalNotes} note${totalNotes !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Premium View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className={`h-9 px-4 transition-all duration-200 ${
                  viewMode === "grid" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-slate-600/50"
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={`h-9 px-4 transition-all duration-200 ${
                  viewMode === "list" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-slate-600/50"
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          {/* Premium Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Enhanced Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-sm"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search your notes..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-slate-800/80 border-slate-600/50 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Premium Topic Filter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl">
                <Filter className="h-4 w-4 text-blue-400" />
                <Select value={selectedTopic} onValueChange={onTopicChange}>
                  <SelectTrigger className="w-40 sm:w-48 bg-transparent border-none text-white focus:ring-0">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Premium Active Filters Display */}
          {(searchQuery || selectedTopic !== "all") && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 pt-4"
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedTopic !== "all" && (
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-sm font-medium">
                  Topic: {selectedTopic}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 