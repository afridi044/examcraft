"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each component tree
  // This ensures that data is not shared between different users/sessions
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized for development performance
            staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time for dev
            gcTime: 15 * 60 * 1000, // 15 minutes - longer cache for dev
            refetchOnWindowFocus: false, // Disabled for better dev performance
            refetchOnMount: false, // Disabled for faster development
            refetchOnReconnect: false, // Disabled for dev
            retry: false, // Disabled for faster development
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      })
  );

  // Memoize toast options to prevent recreation on every render
  const toastOptions = useMemo(
    () => ({
      duration: 3000, // Reduced from 4000ms for better UX
      style: {
        background: "#1f2937",
        color: "#f9fafb",
        border: "1px solid #374151",
      },
      success: {
        style: {
          background: "#065f46",
          border: "1px solid #059669",
        },
      },
      error: {
        style: {
          background: "#7f1d1d",
          border: "1px solid #dc2626",
        },
      },
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" toastOptions={toastOptions} />
      {/* React Query Devtools disabled for faster development */}
    </QueryClientProvider>
  );
}
