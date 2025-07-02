"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useBackendAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior - memoized to prevent re-creating handler
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]); // Now properly memoized

  const handleSignOut = async () => {
    // Immediately redirect to prevent showing loading screen
    router.push("/");
    // Then sign out in the background
    await signOut();
  };



  // OPTIMIZED: Memoize navigation items to prevent re-creation
  const navigationItems = useMemo(
    () => [
      { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { name: "Create Quiz", href: "/quiz/create", icon: BookOpen },
      { name: "Create Exam", href: "/exam/create", icon: Target },
      { name: "Create Flashcards", href: "/flashcards/create", icon: Brain },
      { name: "Your Library", href: "/library", icon: FolderOpen },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
    []
  );

  // OPTIMIZED: Memoize SidebarContent to prevent re-creation
  const SidebarContent = useCallback(
    () => (
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="text-md font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ExamCraft
              </span>
            )}
          </Link>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-400 hover:text-black hover:bg-gray-700/50 ml-2"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}

              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-blue-500 to-purple-600"
                      : "bg-gray-800/50 group-hover:bg-gray-700/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                {isSidebarOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-3 px-4 py-2.5">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    [
      user?.email,
      isSidebarOpen,
      isMobile,
      navigationItems,
      pathname,
      handleSignOut,
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Top Navigation Bar */}
      <TopNavbar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || !isMobile) && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              />
            )}

            {/* Sidebar */}
            <motion.aside
              initial={isMobile ? { x: -300 } : { x: 0 }}
              animate={{ x: 0 }}
              exit={isMobile ? { x: -300 } : { x: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className={`fixed top-[60px] left-0 h-[calc(100vh-60px)] bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 z-50 ${
                isMobile
                  ? "w-[280px]"
                  : isSidebarOpen
                    ? "w-[240px]"
                    : "w-[100px]"
              }`}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isMobile
            ? "pt-[120px]"
            : `pt-[60px] ${isSidebarOpen ? "md:ml-[240px]" : "md:ml-[100px]"}`
        }`}
      >
        {children}
      </main>
    </div>
  );
}
