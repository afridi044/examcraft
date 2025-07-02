import { useState, useEffect, useMemo } from "react";
import { useUserFlashcards } from "@/hooks/useBackendFlashcards";
import { calculateFlashcardStats, FLASHCARD_3D_STYLES } from "@/lib/utils/flashcards";

export function useFlashcardData(userId: string | undefined) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  const {
    data: flashcards,
    isLoading: isLoadingFlashcards,
    refetch: refetchFlashcards,
  } = useUserFlashcards(userId || "");

  // Calculate stats using utility function
  const stats = useMemo(() => {
    return calculateFlashcardStats(flashcards, selectedTopicId);
  }, [flashcards, selectedTopicId]);

  // Inject CSS styles once on mount
  useEffect(() => {
    if (document.querySelector("#flashcard-3d-styles")) return;

    const style = document.createElement("style");
    style.id = "flashcard-3d-styles";
    style.innerHTML = FLASHCARD_3D_STYLES;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.querySelector("#flashcard-3d-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Consolidated event listeners for data refetching
  useEffect(() => {
    if (!userId) return;

    const handleRefetch = () => {
      setTimeout(() => refetchFlashcards(), 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Immediate refetch when page becomes visible
        refetchFlashcards();
        // Also refetch after a short delay to ensure we get the latest data
        setTimeout(() => refetchFlashcards(), 300);
      }
    };

    const handleFocus = () => {
      handleRefetch();
    };

    const handlePageShow = () => {
      setTimeout(() => refetchFlashcards(), 200);
    };

    // Enhanced navigation event handling
    const handlePopState = () => {
      setTimeout(() => refetchFlashcards(), 150);
    };

    const handleBeforeUnload = () => {
      // Refetch when user is about to leave the page
      refetchFlashcards();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId, refetchFlashcards]);

  // Scroll to top when topic changes
  useEffect(() => {
    if (selectedTopicId) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [selectedTopicId]);

  return {
    flashcards,
    isLoadingFlashcards,
    refetchFlashcards,
    selectedTopicId,
    setSelectedTopicId,
    stats,
  };
} 