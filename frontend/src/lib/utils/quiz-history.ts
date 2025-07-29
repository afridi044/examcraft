import { QuizAttempt } from "@/types";

// Helper function to format time from seconds (new format)
export const formatQuizTimeFromSeconds = (timeSeconds: number): string => {
  if (timeSeconds <= 0) return "0s";
  
  // If less than 60 seconds, show as seconds
  if (timeSeconds < 60) {
    return `${Math.round(timeSeconds)}s`;
  }
  
  // For times 1 minute and above, show as "Xm Ys" format
  const totalMinutes = Math.floor(timeSeconds / 60);
  const remainingSeconds = timeSeconds % 60;
  
  if (totalMinutes < 60) {
    // For times under 1 hour, show as "Xm Ys"
    return remainingSeconds > 0 ? `${totalMinutes}m ${remainingSeconds}s` : `${totalMinutes}m`;
  }
  
  // For times over 1 hour, show hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

// Helper function to format time more precisely for quiz history (legacy - for minutes)
export const formatQuizTime = (timeMinutes: number): string => {
  if (timeMinutes <= 0) return "0s";
  
  // If less than 1 minute, show as seconds (convert back from minutes)
  if (timeMinutes < 1) {
    const seconds = Math.round(timeMinutes * 60);
    return `${seconds}s`;
  }
  
  // For times 1 minute and above, show as "Xm Ys" format
  const totalMinutes = Math.floor(timeMinutes);
  const remainingSeconds = Math.round((timeMinutes - totalMinutes) * 60);
  
  if (totalMinutes < 60) {
    // For times under 1 hour, show as "Xm Ys"
    return remainingSeconds > 0 ? `${totalMinutes}m ${remainingSeconds}s` : `${totalMinutes}m`;
  }
  
  // For times over 1 hour, show hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

// Score color utilities
export function getScoreColors(score: number) {
  if (score >= 90) {
    return {
      text: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
  }
  if (score >= 80) {
    return {
      text: "text-green-400",
      badge: "bg-green-500/20 text-green-400 border-green-500/30",
    };
  }
  if (score >= 70) {
    return {
      text: "text-yellow-400",
      badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
  }
  if (score >= 60) {
    return {
      text: "text-orange-400",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
  }
  return {
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
  };
}

// Date formatting
export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "Not completed";
  return new Date(dateString + 'Z').toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Status badge styling
export function getStatusBadge(status: string) {
  // Map old status values to new ones for backward compatibility
  const normalizedStatus = status === "completed" ? "completed" : "not_taken";
  
  switch (normalizedStatus) {
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "not_taken":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

// Status icon configuration
export function getStatusIconConfig(status: string) {
  // Map old status values to new ones for backward compatibility
  const normalizedStatus = status === "completed" ? "completed" : "not_taken";
  
  switch (normalizedStatus) {
    case "completed":
      return { icon: "CheckCircle", className: "h-4 w-4 text-green-400" };
    case "not_taken":
      return { icon: "CircleDot", className: "h-4 w-4 text-blue-400" };
    default:
      return { icon: "CircleDot", className: "h-4 w-4 text-gray-400" };
  }
}

// Calculate quiz statistics
export function calculateQuizStats(attempts: QuizAttempt[] | undefined, searchTerm: string, filterBy: string) {
  if (!attempts?.length) {
    return {
      stats: {
        totalQuizzes: 0,
        completedQuizzes: 0,
        notTakenQuizzes: 0,
        passedQuizzes: 0,
        averageScore: 0,
        averageTime: 0,
        passRate: 0,
      },
      searchFiltered: [],
    };
  }

  // Pre-filter for search
  const searchLower = searchTerm.toLowerCase();
  const searchFiltered = searchTerm
    ? attempts.filter(
        (attempt) =>
          attempt.title.toLowerCase().includes(searchLower) ||
          attempt.topic_name?.toLowerCase().includes(searchLower)
      )
    : attempts;

  // Calculate statistics in a single pass
  let totalQuizzes = 0;
  let completedQuizzes = 0;
  let notTakenQuizzes = 0;
  let totalScore = 0;
  let totalTimeSeconds = 0;
  let passedQuizzes = 0;

  for (const attempt of searchFiltered) {
    totalQuizzes++;

    // Normalize status for backward compatibility
    const normalizedStatus = attempt.status === "completed" ? "completed" : "not_taken";

    if (normalizedStatus === "completed") {
      completedQuizzes++;
      totalScore += attempt.score_percentage;
      totalTimeSeconds += attempt.time_spent_seconds;
      if (attempt.score_percentage >= 70) passedQuizzes++;
    } else {
      notTakenQuizzes++;
    }
  }

  const stats = {
    totalQuizzes,
    completedQuizzes,
    notTakenQuizzes,
    passedQuizzes,
    averageScore:
      completedQuizzes > 0
        ? Math.round(totalScore / completedQuizzes)
        : 0,
    averageTimeSeconds:
      completedQuizzes > 0 ? (totalTimeSeconds / completedQuizzes) : 0,
    passRate:
      completedQuizzes > 0
        ? Math.round((passedQuizzes / completedQuizzes) * 100)
        : 0,
  };

  return { stats, searchFiltered };
}

// Filter and sort attempts
export function filterAndSortAttempts(
  attempts: QuizAttempt[],
  filterBy: string,
  sortBy: "date" | "score" | "title",
  sortOrder: "asc" | "desc"
) {
  return attempts
    .filter((attempt) => {
      if (filterBy === "all") return true;
      if (filterBy === attempt.status) return true;
      if (
        filterBy === "passed" &&
        attempt.status === "completed" &&
        attempt.score_percentage >= 70
      )
        return true;
      if (
        filterBy === "failed" &&
        attempt.status === "completed" &&
        attempt.score_percentage < 70
      )
        return true;
      return false;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date((a.completed_at || a.created_at) + 'Z').getTime() -
            new Date((b.completed_at || b.created_at) + 'Z').getTime();
          break;
        case "score":
          comparison = a.score_percentage - b.score_percentage;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
} 