import type { QuizAttempt } from "@/types";

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
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Status badge styling
export function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "incomplete":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "not_attempted":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "empty":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

// Status icon configuration
export function getStatusIconConfig(status: string) {
  switch (status) {
    case "completed":
      return { icon: "CheckCircle", className: "h-4 w-4 text-green-400" };
    case "incomplete":
      return { icon: "Pause", className: "h-4 w-4 text-yellow-400" };
    case "not_attempted":
      return { icon: "CircleDot", className: "h-4 w-4 text-blue-400" };
    case "empty":
      return { icon: "AlertCircle", className: "h-4 w-4 text-gray-400" };
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
        incompleteQuizzes: 0,
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
  let incompleteQuizzes = 0;
  let totalScore = 0;
  let totalTime = 0;
  let passedQuizzes = 0;

  for (const attempt of searchFiltered) {
    totalQuizzes++;

    if (attempt.status === "completed") {
      completedQuizzes++;
      totalScore += attempt.score_percentage;
      totalTime += attempt.time_spent_minutes;
      if (attempt.score_percentage >= 70) passedQuizzes++;
    } else if (attempt.status === "incomplete") {
      incompleteQuizzes++;
      totalScore += attempt.score_percentage;
    }
  }

  const stats = {
    totalQuizzes,
    completedQuizzes,
    incompleteQuizzes,
    passedQuizzes,
    averageScore:
      completedQuizzes + incompleteQuizzes > 0
        ? Math.round(totalScore / (completedQuizzes + incompleteQuizzes))
        : 0,
    averageTime:
      completedQuizzes > 0 ? Math.round(totalTime / completedQuizzes) : 0,
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
            new Date(a.completed_at || a.created_at).getTime() -
            new Date(b.completed_at || b.created_at).getTime();
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