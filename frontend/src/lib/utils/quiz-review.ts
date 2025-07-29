// Time formatting utility - improved to show more user-friendly format
export function formatTime(seconds: number): string {
  if (seconds <= 0) return "0s";
  
  // If less than 60 seconds, show as seconds
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  // For times 1 minute and above, show as "Xm Ys" format
  const totalMinutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (totalMinutes < 60) {
    // For times under 1 hour, show as "Xm Ys"
    return remainingSeconds > 0 ? `${totalMinutes}m ${remainingSeconds}s` : `${totalMinutes}m`;
  }
  
  // For times over 1 hour, show hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

// Difficulty configuration
export const DIFFICULTY_CONFIG = {
  labels: ["", "Beginner", "Easy", "Medium", "Hard", "Expert"],
  colors: [
    "",
    "text-green-400",
    "text-blue-400",
    "text-yellow-400",
    "text-orange-400",
    "text-red-400",
  ],
} as const;

// Difficulty label utility
export function getDifficultyLabel(difficulty?: number): string {
  return DIFFICULTY_CONFIG.labels[difficulty || 0] || "Unknown";
}

// Difficulty color utility
export function getDifficultyColor(difficulty?: number): string {
  return DIFFICULTY_CONFIG.colors[difficulty || 0] || "text-gray-400";
} 