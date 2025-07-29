"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { LibraryHeader } from "@/components/features/library/LibraryHeader";
import { LibraryTabs } from "@/components/features/library/LibraryTabs";
import { LibraryContent } from "@/components/features/library/LibraryContent";
import { AddNewButton } from "@/components/features/library/AddNewButton";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import type { StudyNote } from "@/types";


type LibraryTab = "notes" | "materials" | "books";

export default function LibraryPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // EARLY REDIRECT: Check authentication immediately
  useEffect(() => {
    if (!userLoading && !currentUser) {
      setSignOutMessage();
      router.push("/auth/signin");
    }
  }, [userLoading, currentUser, router, setSignOutMessage]);

  // Don't render anything while redirecting
  if (!userLoading && !currentUser) {
    return null;
  }

  // Loading state
  if (userLoading) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Library"
          subtitle="Preparing your learning resources..."
          variant="dashboard"
        />
      </DashboardLayout>
    );
  }

                return (
                <DashboardLayout>
                  <div className="space-y-4 sm:space-y-6">
                    {/* Header Section */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <LibraryHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                      />
                    </motion.div>

                    {/* Tabs Navigation */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <LibraryTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                      />
                    </motion.div>

                    {/* Content Area */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <LibraryContent
                        activeTab={activeTab}
                        searchQuery={searchQuery}
                        viewMode={viewMode}
                      />
                    </motion.div>

                    {/* Floating Add Button */}
                    <AddNewButton />
                  </div>
                </DashboardLayout>
              );
} 