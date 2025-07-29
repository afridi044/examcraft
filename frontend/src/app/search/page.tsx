"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchService, type SearchResults, type QuizSearchResult, type FlashcardSearchResult } from "@/lib/services/search.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BookOpen, 
  Brain, 
  Calendar, 
  ArrowRight, 
  Play, 
  Eye, 
  Target,
  Clock,
  TrendingUp,
  Filter,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Zap,
  Star,
  CheckCircle,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { PageLoading } from "@/components/ui/loading";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "quizzes" | "flashcards">("all");
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query.trim()) {
      setSearchInput(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchService.searchAll(searchQuery);
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || "Failed to search");
      }
    } catch (err) {
      setError("An error occurred while searching");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleQuizClick = (quiz: QuizSearchResult) => {
    if (quiz.has_attempt) {
      router.push(`/quiz/review/${quiz.quiz_id}`);
    } else {
      router.push(`/quiz/take/${quiz.quiz_id}`);
    }
  };

  const handleFlashcardClick = (flashcard: FlashcardSearchResult) => {
    // Smart navigation based on mastery status
    const hasBeenStudied = flashcard.mastery_status && flashcard.mastery_status !== 'learning';
    const isMastered = flashcard.mastery_status === 'mastered';
    
    if (flashcard.topic_id) {
      if (isMastered) {
        // If mastered, go to review mode
        router.push(`/flashcards/study/${flashcard.topic_id}?mode=review`);
      } else if (hasBeenStudied) {
        // If studied before but not mastered, go to practice mode
        router.push(`/flashcards/study/${flashcard.topic_id}?mode=practice`);
      } else {
        // If new or learning, go to learning mode
        router.push(`/flashcards/study/${flashcard.topic_id}?mode=learn`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'Z').toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString + 'Z');
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const filteredResults = () => {
    if (!results) return { quizzes: [], flashcards: [] };
    
    switch (activeTab) {
      case "quizzes":
        return { quizzes: results.quizzes, flashcards: [] };
      case "flashcards":
        return { quizzes: [], flashcards: results.flashcards };
      default:
        return results;
    }
  };

  const totalResults = (results?.quizzes.length || 0) + (results?.flashcards.length || 0);

  // Empty state
  if (!query.trim()) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <DashboardHeader
              title="Search Learning Content"
              subtitle="Find quizzes, flashcards, and study materials across your learning library"
              iconLeft={<Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto px-4 sm:px-0"
          >
            <Card className="bg-slate-900/80 border-slate-800/80 p-6 sm:p-8 text-center">
              <div className="mb-6">
                <div className="relative inline-block">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400 mx-auto mb-4" />
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-3">Discover Your Learning Content</h2>
                <p className="text-sm sm:text-base text-gray-400 mb-6">
                  Search through your quizzes, flashcards, and study materials to find exactly what you need
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for topics, questions, or content..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 w-full sm:w-auto"
                  disabled={!searchInput.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Content
                </Button>
              </form>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-100 mb-1 text-sm sm:text-base">Quizzes</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Test your knowledge</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-100 mb-1 text-sm sm:text-base">Flashcards</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Review key concepts</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-100 mb-1 text-sm sm:text-base">Topics</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Organized learning</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <DashboardHeader
            title={`Search Results for "${query}"`}
            subtitle={`Found ${totalResults} result${totalResults !== 1 ? "s" : ""} across your learning content`}
            iconLeft={<Search className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />}
            rightContent={
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search again..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
                <Button 
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  disabled={!searchInput.trim()}
                >
                  Search
                </Button>
              </form>
            }
          />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12 sm:py-20"
          >
            <PageLoading
              title="Searching..."
              subtitle="Finding the best matches for your query"
              variant="dashboard"
            />
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-12 sm:py-20 px-4"
          >
            <Card className="bg-slate-900/80 border-red-500/20 p-6 sm:p-8 max-w-md mx-auto text-center">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2">Search Error</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-6">{error}</p>
              <Button 
                onClick={() => performSearch(query)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {!loading && !error && results && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${totalResults}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Premium Tab Navigation */}
              <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl w-full sm:w-fit border border-slate-700/50">
                <Button
                  variant={activeTab === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg transition-all duration-200 flex-1 ${
                    activeTab === "all" 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Target className="h-4 w-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={activeTab === "quizzes" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("quizzes")}
                  className={`rounded-lg transition-all duration-200 flex-1 ${
                    activeTab === "quizzes" 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Quizzes
                </Button>
                <Button
                  variant={activeTab === "flashcards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("flashcards")}
                  className={`rounded-lg transition-all duration-200 flex-1 ${
                    activeTab === "flashcards" 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Flashcards
                </Button>
              </div>

              {/* Results Grid */}
              <div className="space-y-6 sm:space-y-8">
                {/* Quiz Results */}
                {filteredResults().quizzes.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
                          Quiz Results ({filteredResults().quizzes.length})
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400">Test your knowledge with these quizzes</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {filteredResults().quizzes.map((quiz, index) => (
                        <motion.div
                          key={quiz.quiz_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card 
                            className="bg-slate-900/80 border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group relative overflow-hidden"
                            onClick={() => handleQuizClick(quiz)}
                          >
                            {/* Premium gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <CardHeader className="pb-3 sm:pb-4 relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <CardTitle className="text-base sm:text-lg line-clamp-2 text-gray-100 group-hover:text-white transition-colors">
                                  {quiz.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  {quiz.has_attempt ? (
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                  ) : (
                                    <Play className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {quiz.topic_name && (
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                    {quiz.topic_name}
                                  </Badge>
                                )}
                                {quiz.has_attempt && (
                                  <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10 text-xs">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 relative z-10">
                              {quiz.description && (
                                <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4 group-hover:text-gray-300 transition-colors">
                                  {quiz.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {getTimeAgo(quiz.created_at)}
                                </span>
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : activeTab === "quizzes" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center py-12 sm:py-20 px-4"
                  >
                    <Card className="bg-slate-900/80 border-slate-800/80 p-6 sm:p-8 max-w-md mx-auto">
                      <div className="relative inline-block mb-6">
                        <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto" />
                        <div className="absolute -top-2 -right-2">
                          <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">No quiz results found</h3>
                      <p className="text-sm sm:text-base text-gray-400 mb-6">
                        Try adjusting your search terms or browse other content types
                      </p>
                      <div className="space-y-3">
                        <Button 
                          onClick={() => setActiveTab("all")}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          View All Results
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => router.push('/quiz/create')}
                          className="w-full bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 text-gray-300 hover:text-white"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Create Quiz
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Flashcard Results */}
                {filteredResults().flashcards.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
                          Flashcard Results ({filteredResults().flashcards.length})
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400">Review key concepts with these flashcards</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {filteredResults().flashcards.map((flashcard, index) => (
                        <motion.div
                          key={flashcard.flashcard_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card 
                            className="bg-slate-900/80 border-slate-800/80 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group relative overflow-hidden"
                            onClick={() => handleFlashcardClick(flashcard)}
                          >
                            {/* Premium gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <CardHeader className="pb-3 sm:pb-4 relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <CardTitle className="text-base sm:text-lg line-clamp-2 text-gray-100 group-hover:text-white transition-colors">
                                  {flashcard.question}
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  {flashcard.mastery_status === 'mastered' ? (
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                  ) : flashcard.mastery_status === 'under_review' ? (
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {flashcard.topic_name && (
                                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                    {flashcard.topic_name}
                                  </Badge>
                                )}
                                {flashcard.mastery_status === 'mastered' && (
                                  <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10 text-xs">
                                    Mastered
                                  </Badge>
                                )}
                                {flashcard.mastery_status === 'under_review' && (
                                  <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10 text-xs">
                                    Review
                                  </Badge>
                                )}
                                {flashcard.mastery_status === 'learning' && (
                                  <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-500/10 text-xs">
                                    Learning
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 relative z-10">
                              <p className="text-gray-400 text-xs sm:text-sm line-clamp-3 mb-3 sm:mb-4 group-hover:text-gray-300 transition-colors">
                                {flashcard.answer}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {getTimeAgo(flashcard.created_at)}
                                </span>
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : activeTab === "flashcards" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center py-12 sm:py-20 px-4"
                  >
                    <Card className="bg-slate-900/80 border-slate-800/80 p-6 sm:p-8 max-w-md mx-auto">
                      <div className="relative inline-block mb-6">
                        <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto" />
                        <div className="absolute -top-2 -right-2">
                          <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">No flashcard results found</h3>
                      <p className="text-sm sm:text-base text-gray-400 mb-6">
                        Try adjusting your search terms or browse other content types
                      </p>
                      <div className="space-y-3">
                        <Button 
                          onClick={() => setActiveTab("all")}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          View All Results
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => router.push('/flashcards/create')}
                          className="w-full bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 text-gray-300 hover:text-white"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Create Flashcards
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* No Results */}
                {totalResults === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 sm:py-20 px-4"
                  >
                    <Card className="bg-slate-900/80 border-slate-800/80 p-6 sm:p-8 max-w-md mx-auto">
                      <div className="relative inline-block mb-6">
                        <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto" />
                        <div className="absolute -top-2 -right-2">
                          <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">No results found</h3>
                      <p className="text-sm sm:text-base text-gray-400 mb-6">
                        Try adjusting your search terms or browse our content library
                      </p>
                      <Button 
                        onClick={() => router.push('/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Dashboard
                      </Button>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
} 