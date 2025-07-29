"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, X, User, UserPlus, LogIn, Crown } from "lucide-react";
import React from "react";


export function DashboardSidebar({
    open,
    onClose,
    isMobile,
    navigationItems,
    pathname,
    user,
    handleSignOut,
    sidebarRef,
    side = "left",
}: {
    open: boolean;
    onClose: () => void;
    isMobile: boolean;
    navigationItems: Array<{ name: string; href: string; icon: any }>;
    pathname: string;
    user: any;
    handleSignOut: () => void;
    sidebarRef: React.RefObject<HTMLDivElement | null>;
    side?: "left" | "right";
}) {

    const positionClass = side === "right" ? "right-0" : "left-0";
    const initialX = side === "right" ? 320 : -320;
    const exitX = side === "right" ? 320 : -320;
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={sidebarRef}
                    initial={{ x: initialX }}
                    animate={{ x: 0 }}
                    exit={{ x: exitX }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className={`fixed top-0 ${positionClass} h-full z-50 backdrop-blur-xl shadow-2xl ${
                        "bg-white/5 border-r border-white/10"
                        } ${isMobile ? "w-72" : "w-80"}`}
                >
                    <div className="flex flex-col h-full p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <Link href="/dashboard" className="flex items-center space-x-3">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-base sm:text-lg font-bold ${
                                        "text-white"
                                    }`}>ExamCraft</h1>
                                    <p className={`text-xs hidden sm:block ${
                                        "text-gray-400"
                                    }`}>AI-Powered Learning</p>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className={`h-8 w-8 rounded-lg ${
                                    "text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* Navigation */}
                        <nav className="flex-1 space-y-2">
                            <div className="mb-4 sm:mb-6">
                                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${
                                    "text-gray-400"
                                }`}>
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
                                                <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                                    isActive ? 'text-white' : "text-gray-300"
                                                }`} />
                                            </div>
                                            <span className="font-medium text-sm sm:text-base">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                        {/* Profile Section */}
                        <div className={`border-t pt-4 sm:pt-6 ${
                            "border-white/10"
                        }`}>
                            <div className={`rounded-xl p-3 sm:p-4 ${
                                "bg-white/5 border border-white/10"
                            }`}>
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs sm:text-sm font-medium truncate ${
                                            "text-white"
                                        }`}>
                                            {user?.first_name || user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "User"}
                                        </p>
                                        <p className={`text-xs ${
                                            "text-gray-400"
                                        }`}>{user?.email}</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSignOut}
                                    variant="ghost"
                                    size="sm"
                                    className={`w-full justify-start rounded-lg text-xs sm:text-sm ${
                                        "text-gray-300 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function SimpleSidebar({
    open,
    onClose,
    isMobile,
    navigationItems,
    pathname,
    sidebarRef,
    side = "left",
}: {
    open: boolean;
    onClose: () => void;
    isMobile: boolean;
    navigationItems: Array<{ name: string; href: string; icon: any }>;
    pathname: string;
    sidebarRef: React.RefObject<HTMLDivElement | null>;
    side?: "left" | "right";
}) {
    const positionClass = side === "right" ? "right-0" : "left-0";
    const initialX = side === "right" ? 320 : -320;
    const exitX = side === "right" ? 320 : -320;
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={sidebarRef}
                    initial={{ x: initialX }}
                    animate={{ x: 0 }}
                    exit={{ x: exitX }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className={`fixed top-0 ${positionClass} z-50 h-screen backdrop-blur-xl shadow-2xl ${
                        "bg-white/5 border-r border-white/10"
                        } ${isMobile ? "w-72" : "w-80"}`}
                >
                    <div className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <Link href="/" className="flex items-center space-x-3">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <Crown className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-base sm:text-lg font-bold ${
                                        "text-white"
                                    }`}>ExamCraft</h1>
                                    <p className={`text-xs hidden sm:block ${
                                        "text-gray-400"
                                    }`}>AI-Powered Learning</p>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* Navigation */}
                        <nav>
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
                                            className={`group flex items-center space-x-3 px-3 py-2.5 sm:py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg"
                                                : "text-gray-300 hover:text-white hover:bg-white/10"
                                                }`}
                                        >
                                            <div
                                                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive
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
                        {/* Auth Buttons */}
                        <div className="mt-8">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                                Get Started
                            </p>
                            <div className="space-y-3">
                                <Link href="/auth/signup" className="block" onClick={onClose}>
                                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-gray-200 font-semibold rounded-xl shadow-md hover:shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center text-base">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Sign Up
                                    </Button>
                                </Link>
                                <Link href="/auth/signin" className="block" onClick={onClose}>
                                    <Button
                                        className="w-full h-12 bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900 text-gray-200 font-semibold rounded-xl shadow-md hover:shadow-gray-600/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center text-base"
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
} 