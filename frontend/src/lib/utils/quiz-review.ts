// Time formatting utility
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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