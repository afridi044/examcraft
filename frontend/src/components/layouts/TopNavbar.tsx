"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Search, Crown, User } from "lucide-react";

export function TopNavbar() {
  const router = useRouter();
  const { user } = useBackendAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="h-[60px] fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ExamCraft
          </span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-2xl mx-8"
        >
          <div className="relative">
            <Input
              type="search"
              placeholder="Search quizzes, exams, or flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search icon for mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-400 hover:text-white hover:bg-gray-800/50"
            onClick={() => {
              /* Add mobile search modal logic */
            }}
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <Crown className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Upgrade</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {user?.email?.split("@")[0]}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
