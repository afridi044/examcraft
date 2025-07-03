"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { TopNavbar } from "./TopNavbar";
import {
  BarChart3,
  BookOpen,
  Target,
  Brain,
  FolderOpen,
  Settings,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useBackendAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSignOut = async () => {
    router.push("/");
    await signOut();
  };

  // Navigation items
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Quizes", href: "/dashboard/quiz-history", icon: BookOpen },
    { name: "Create Exam", href: "/exam/create", icon: Target },
    { name: "Flashcards", href: "/flashcards", icon: Brain },
    { name: "Your Library", href: "/library", icon: FolderOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900">
      {/* Top Navigation Bar */}
      <TopNavbar setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />

      {/* Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed top-0 left-0 h-full z-50 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl ${
              isMobile ? "w-72" : "w-80"
            }`}
          >
            <div className="flex flex-col h-full p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <Link href="/dashboard" className="flex items-center space-x-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-white">ExamCraft</h1>
                    <p className="text-xs text-gray-400 hidden sm:block">AI-Powered Learning</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                    Navigation
                  </p>
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center space-x-3 px-3 py-2.5 sm:py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <div
                          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                              : "bg-white/10 group-hover:bg-white/20"
                          }`}
                        >
                          <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <span className="font-medium text-sm sm:text-base">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Profile Section */}
              <div className="border-t border-white/10 pt-4 sm:pt-6">
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {user?.email || "User"}
                      </p>
                      <p className="text-xs text-gray-400">Premium Account</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 rounded-lg text-xs sm:text-sm"
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Properly spaced and responsive */}
      <main className={`min-h-screen transition-all duration-300 ${
        isMobile 
          ? "pt-[72px] px-4 pb-4" 
          : "pt-[88px] px-6 pb-6"
      }`}>
        <div className="max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
