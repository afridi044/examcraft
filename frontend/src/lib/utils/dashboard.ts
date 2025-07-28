import { LucideIcon, BookOpen, Target, Brain, Clock, BarChart3, Plus, Star, Sparkles, Trophy, Flame, Activity, Rocket, TrendingUp, Calendar } from "lucide-react";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

export const getActivityIcon = (type: string): LucideIcon => {
  switch (type) {
    case "quiz":
      return BookOpen;
    case "exam":
      return Target;
    case "flashcard":
      return Brain;
    default:
      return BookOpen;
  }
};

// Enhanced function to get appropriate icon based on activity title
export const getActivityIconFromTitle = (title: string): LucideIcon => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('created') && lowerTitle.includes('quiz')) {
    return Plus;
  } else if (lowerTitle.includes('completed') && lowerTitle.includes('quiz')) {
    return BookOpen;
  }
  
  // Default icon for quiz activities
  if (lowerTitle.includes('quiz')) {
    return BookOpen;
  }
  
  return BookOpen;
};

export const STAT_CARDS_CONFIG = [
  {
    key: "totalQuizzes",
    title: "Total Quizzes",
    icon: BookOpen,
    iconBgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconShadowColor: "shadow-blue-500/20",
    borderHoverColor: "blue-500/30",
    shadowHoverColor: "blue-500/10",
    trendText: "+12%",
    href: "/dashboard/quiz-history",
    ariaLabel: "View Quiz History",
    suffix: "",
  },
  {
    key: "totalExams",
    title: "Total Exams",
    icon: Target,
    iconBgColor: "bg-gradient-to-br from-green-500 to-green-600",
    iconShadowColor: "shadow-green-500/20",
    borderHoverColor: "green-500/30",
    shadowHoverColor: "green-500/10",
    trendText: "+8%",
    suffix: "",
  },
  {
    key: "totalFlashcards",
    title: "Flashcards",
    icon: Brain,
    iconBgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
    iconShadowColor: "shadow-purple-500/20",
    borderHoverColor: "purple-500/30",
    shadowHoverColor: "purple-500/10",
    trendText: "+15%",
    href: "/flashcards",
    ariaLabel: "View Flashcards",
    suffix: "",
  },
  {
    key: "averageScore",
    title: "Overall Score",
    icon: TrendingUp,
    iconBgColor: "bg-gradient-to-br from-amber-500 to-amber-600",
    iconShadowColor: "shadow-amber-500/20",
    borderHoverColor: "amber-500/30",
    shadowHoverColor: "amber-500/10",
    trendText: "+5%",
    suffix: "%",
  },
  {
    key: "studyStreak",
    title: "Study Streak",
    icon: Calendar,
    iconBgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
    iconShadowColor: "shadow-orange-500/20",
    borderHoverColor: "orange-500/30",
    shadowHoverColor: "orange-500/10",
    trendText: "Keep it up!",
    suffix: " days",
  },
  {
    key: "questionsAnswered",
    title: "Questions Answered",
    icon: BarChart3,
    iconBgColor: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    iconShadowColor: "shadow-indigo-500/20",
    borderHoverColor: "indigo-500/30",
    shadowHoverColor: "indigo-500/10",
    trendText: "+20%",
    suffix: "",
  },
]; 