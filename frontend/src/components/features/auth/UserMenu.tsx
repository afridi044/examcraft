import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Settings, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
  user: { full_name?: string; email?: string } | null;
  signOut: () => Promise<void>;
  router: any;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, signOut, router }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Helper function to get user's first name
  const getUserFirstName = () => {
    if (!user?.full_name) return "User";
    const nameParts = user.full_name.trim().split(' ');
    return nameParts[0] || "User";
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
  };

  return (
    <div className="relative" ref={userMenuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className={`flex items-center gap-2 transition-all duration-300 rounded-xl h-10 px-3 group shadow-md ${
          isUserMenuOpen 
            ? "bg-gradient-to-br from-slate-700/90 to-slate-800/90 border-slate-600/80 text-white shadow-lg" 
            : "bg-slate-800/60 hover:bg-slate-700/60 border-slate-700/60 text-slate-300 hover:text-white"
        } border`}
      >
        <div className="h-7 w-7 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md ring-2 ring-blue-400/20">
          <span className="text-white font-semibold text-sm drop-shadow-sm">
            {getUserFirstName()?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
        <span className="hidden sm:block font-medium text-sm max-w-[120px] truncate">
          {getUserFirstName()}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`} />
      </Button>
      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 top-12 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-blue-900/20 z-50 overflow-hidden ring-1 ring-blue-400/10"
          >
            {/* User Info */}
            <div className="p-4 border-b border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
                  <span className="text-white font-semibold drop-shadow-sm">
                    {getUserFirstName()?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent truncate">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
            {/* Menu Items */}
            <div className="p-2">
              <Link
                href="/dashboard"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-indigo-500/10 rounded-xl transition-all duration-200 group"
              >
                <div className="h-8 w-8 bg-slate-800/80 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-colors duration-200">
                  <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-indigo-500/10 rounded-xl transition-all duration-200 group"
              >
                <div className="h-8 w-8 bg-slate-800/80 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-colors duration-200">
                  <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-medium">Settings</span>
              </Link>
              <div className="h-px bg-gradient-to-r from-slate-700/0 via-slate-700/60 to-slate-700/0 my-2" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-gradient-to-br hover:from-red-500/10 hover:to-pink-500/10 rounded-xl transition-all duration-200 group"
              >
                <div className="h-8 w-8 bg-slate-800/80 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-500/20 group-hover:to-pink-500/20 transition-colors duration-200">
                  <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 