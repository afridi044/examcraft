"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  X, 
  Sparkles
} from "lucide-react";

interface MobileSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSearchModal({ open, onOpenChange }: MobileSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Reset search query when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setIsFocused(false);
    }
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Search Learning Content</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative"
        >
          {/* Premium Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/50" />
          
          {/* Content */}
          <div className="relative p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl blur-md opacity-0 animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Search Learning</h2>
                  <p className="text-sm text-gray-400">Find quizzes, flashcards & more</p>
                </div>
              </motion.div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-gray-400 hover:text-white transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch}
              className="space-y-4"
            >
              <div className="relative group">
                {/* Animated Background */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-600/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for topics, questions, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="h-12 pl-12 pr-4 bg-slate-800/60 border-slate-700/60 text-slate-200 placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium transition-all duration-300 focus:bg-slate-800/80 shadow-inner shadow-slate-900/70"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-slate-700/60 border border-slate-600/60 text-slate-400 text-xs rounded-md shadow-sm">
                      ⌘K
                    </kbd>
                    <Sparkles className="h-3 w-3 text-blue-400/70 ml-1 hidden sm:block" />
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Content
              </Button>
            </motion.form>


          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
} 