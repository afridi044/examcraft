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
import { DashboardSidebar } from "./DashboardSidebar";

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
    await signOut();
  };

  // Navigation items
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Quizes", href: "/dashboard/quiz-history", icon: BookOpen },
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

      {/* Sidebar */}
      <DashboardSidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
        navigationItems={navigationItems}
        pathname={pathname}
        user={user}
        handleSignOut={handleSignOut}
        sidebarRef={sidebarRef}
      />

      {/* Main Content - Properly spaced and responsive */}
      <main className={`transition-all duration-300 ${isMobile
        ? "pt-[72px] px-7 pb-7 max-w-2xl mx-auto w-full"
        : "pt-[88px] px-6 pb-6 max-w-7xl mx-auto w-full"
        }`}>
        {children}
      </main>
    </div>
  );
}
