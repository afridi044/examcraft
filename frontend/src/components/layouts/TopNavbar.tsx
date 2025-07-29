"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Search, 
  Crown, 
  Bell, 
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { UserMenu } from "@/components/ui/user-menu";
import { MobileSearchModal } from "@/components/ui/mobile-search-modal";

interface TopNavbarProps {
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  hideSearchBar?: boolean;
}

export function TopNavbar({ setIsSidebarOpen, hideSearchBar = false }: TopNavbarProps) {
  const router = useRouter();
  const { user, signOut } = useBackendAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for premium blur/shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if the menu is open and the click is outside the menu
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    // Add event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up on unmount or when dependencies change
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false); // Close mobile search modal
    }
  };

  return (
    <>
      <motion.div 
        className={`h-[72px] fixed top-0 left-0 right-0 z-50 transition-all duration-300 premium-glass ${
          isScrolled 
            ? "bg-slate-950/95 backdrop-blur-2xl border-b border-slate-700/60 shadow-xl shadow-blue-900/10" 
            : "bg-slate-950/95 backdrop-blur-xl border-b border-slate-700/40 animate-gradient"
        }`}
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-x-4">
            {/* Sidebar Toggle Button */}
            <button
              className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-all duration-300"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
            
            {/* Premium Logo */}
            <Link href="/dashboard" className="hidden lg:flex items-center space-x-3 group">
              <div className="relative">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-md" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                  ExamCraft
                </span>
                <span className="text-xs bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-medium -mt-1 hidden sm:block">
                  AI-Powered Learning
                </span>
              </div>
            </Link>
          </div>

          {/* Center Section - Search Bar */}
          {!hideSearchBar && (
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search quizzes, exams, flashcards, or ask AI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 pr-4 bg-slate-800/60 border-slate-700/60 text-slate-200 placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-2xl font-medium transition-all duration-300 focus:bg-slate-800/80 shadow-inner shadow-slate-900/70"
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
              </form>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-x-3">
            {/* Search for mobile/tablet */}
            {!hideSearchBar && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300 hover:text-white transition-all duration-300 rounded-xl h-10 w-10 shadow-md"
                onClick={() => setIsMobileSearchOpen(true)}
              >
                <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            )}



            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300 hover:text-white transition-all duration-300 rounded-xl h-10 w-10 relative shadow-md hover:shadow-lg"
            >
              <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
              </div>
            </Button>

            {/* Premium User Menu */}
            <UserMenu user={user} signOut={async () => { await signOut(); }} router={router} />
          </div>
        </div>
      </motion.div>
      {/* Spacer to push content below navbar */}
      <div className="h-4" aria-hidden="true"></div>

      {/* Premium Mobile Search Modal */}
      <MobileSearchModal 
        open={isMobileSearchOpen} 
        onOpenChange={setIsMobileSearchOpen} 
      />
    </>
  );
}
