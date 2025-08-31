import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDateLocal, formatDateTimeLocal, getRelativeTime } from "./utils/timezone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to a readable string (now uses timezone-aware utility)
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return formatDateLocal(date, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format date with time (now uses timezone-aware utility)
export function formatDateTime(date: string | Date): string {
  if (typeof date === 'string') {
    return formatDateTimeLocal(date, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Calculate time elapsed since a given date (now uses timezone-aware utility)
export function timeAgo(date: string | Date): string {
  if (typeof date === 'string') {
    return getRelativeTime(date);
  }
  
  // Handle Date object (existing logic)
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now.getTime() - past.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else {
    return "Just now";
  }
}

// Truncate text if it's too long
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
