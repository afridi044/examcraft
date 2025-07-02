"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import {
  useTopics,
  useCurrentUser,
  useInvalidateUserData,
} from "@/hooks/useDatabase";
import { quizService } from "@/lib/services";
import { motion } from "framer-motion";
import {
  Brain,
  Loader2,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  Users,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface QuizForm {
  title: string;
  description: string;
  topic_id: string;
  custom_topic: string;
  difficulty: number;
  num_questions: number;
  content_source: string;
  additional_instructions: string;
}

const DEFAULT_FORM: QuizForm = {
  title: "",
  description: "",
  topic_id: "",
  custom_topic: "",
  difficulty: 3,
  num_questions: 10,
  content_source: "",
  additional_instructions: "",
};

const DIFFICULTY_LEVELS = [
  { value: 1, label: "Beginner", color: "text-green-400" },
  { value: 2, label: "Easy", color: "text-blue-400" },
  { value: 3, label: "Medium", color: "text-yellow-400" },
  { value: 4, label: "Hard", color: "text-orange-400" },
  { value: 5, label: "Expert", color: "text-red-400" },
];

export default function CreateQuizPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useBackendAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: topics = [], isLoading: topicsLoading } = useTopics();
  const invalidateUserData = useInvalidateUserData();

  const [form, setForm] = useState<QuizForm>(DEFAULT_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<{
    quiz_id: string;
    title: string;
    num_questions: number;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // Simple loading check
  const isLoading = authLoading || (user && userLoading) || topicsLoading;

  const updateForm = (field: keyof QuizForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Quiz title is required");
      return false;
    }
    if (!form.topic_id && !form.custom_topic.trim()) {
      toast.error("Please select a topic or enter a custom topic");
      return false;
    }
    if (form.num_questions < 5 || form.num_questions > 50) {
      toast.error("Number of questions must be between 5 and 50");
      return false;
    }
    return true;
  };

  const handleGenerateQuiz = async () => {
    if (!validateForm() || !currentUser) return;

    setIsGenerating(true);
    try {
      const topic = form.topic_id
        ? topics?.find(t => t.topic_id === form.topic_id)?.name || form.custom_topic
        : form.custom_topic;

      const response = await quizService.generateQuiz({
        topic,
        difficulty: form.difficulty === 1 ? 'easy' : form.difficulty <= 3 ? 'medium' : 'hard',
        questionCount: form.num_questions,
        userId: currentUser.user_id,
      });

      if (!response.success || !response.data?.quiz) {
        throw new Error(response.error || "Failed to generate quiz");
      }

      toast.success("Quiz generated successfully!");
      
      // Invalidate cache for real-time updates
      invalidateUserData(currentUser.user_id);

      setGeneratedQuiz({
        quiz_id: response.data.quiz.quiz_id,
        title: response.data.quiz.title,
        num_questions: form.num_questions,
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setGeneratedQuiz(null);
    setForm(DEFAULT_FORM);
  };

  const navigateToDashboard = () => {
    if (currentUser?.user_id) {
      invalidateUserData(currentUser.user_id);
    }
    router.push("/dashboard");
  };

  // Loading screen
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Loading Quiz Creator...
            </h2>
            <p className="text-gray-400">Preparing your AI-powered quiz generator</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Success screen
  if (generatedQuiz) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-20 space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 sm:space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Quiz Generated Successfully!
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Your AI-powered quiz has been created and is ready to take.
              </p>
            </div>

            <Card className="bg-gray-800/50 border-gray-700/50 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {generatedQuiz.title}
                  </h2>
                  <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-gray-400 text-sm sm:text-base">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{generatedQuiz.num_questions} Questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>~{Math.ceil(generatedQuiz.num_questions * 1.5)} min</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button
                      onClick={() => router.push(`/quiz/take/${generatedQuiz.quiz_id}`)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-200"
                    >
                      Take Quiz Now
                    </Button>
                    <Button
                      onClick={navigateToDashboard}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50 px-6 py-3"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Return to Dashboard
                    </Button>
                  </div>

                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Create Another Quiz
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Main form
  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Quiz Generator
              </h1>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Create personalized multiple-choice quizzes with AI. Provide your topic and content, and our AI will generate engaging MCQ questions tailored to your needs.
            </p>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-800/50 border-gray-700/50 p-4 sm:p-6 lg:p-8">
              <div className="space-y-6 sm:space-y-8">
                {/* Basic Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Basic Information</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-300">Quiz Title</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => updateForm("title", e.target.value)}
                        placeholder="e.g., JavaScript Fundamentals"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                      <Input
                        id="description"
                        value={form.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                        placeholder="Brief description of the quiz"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Topic Selection */}
                  <div className="space-y-4">
                    <Label className="text-gray-300">Topic</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="topic" className="text-sm text-gray-400">Select from existing topics</Label>
                        <select
                          id="topic"
                          value={form.topic_id}
                          onChange={(e) => updateForm("topic_id", e.target.value)}
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base"
                        >
                          <option value="">Choose a topic...</option>
                          {topics?.map((topic) => (
                            <option key={topic.topic_id} value={topic.topic_id}>
                              {topic.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom_topic" className="text-sm text-gray-400">Or enter custom topic</Label>
                        <Input
                          id="custom_topic"
                          value={form.custom_topic}
                          onChange={(e) => updateForm("custom_topic", e.target.value)}
                          placeholder="e.g., React Hooks"
                          className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quiz Configuration */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Quiz Configuration</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Difficulty Level */}
                    <div className="space-y-4">
                      <Label className="text-gray-300">Difficulty Level</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {DIFFICULTY_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            onClick={() => updateForm("difficulty", level.value)}
                            className={`p-2 sm:p-3 rounded-lg border text-center transition-all ${
                              form.difficulty === level.value
                                ? "border-purple-500 bg-purple-500/20 text-purple-300"
                                : "border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500"
                            }`}
                          >
                            <div className="text-sm font-medium">{level.value}</div>
                            <div className={`text-xs ${level.color}`}>{level.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Questions */}
                    <div className="space-y-2">
                      <Label htmlFor="num_questions" className="text-gray-300">Number of Questions (5-50)</Label>
                      <Input
                        id="num_questions"
                        type="number"
                        min="5"
                        max="50"
                        value={form.num_questions}
                        onChange={(e) => updateForm("num_questions", parseInt(e.target.value))}
                        className="bg-gray-700/50 border-gray-600 text-white text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Source */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Content & Instructions</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content_source" className="text-gray-300">Content Source (Optional)</Label>
                      <textarea
                        id="content_source"
                        value={form.content_source}
                        onChange={(e) => updateForm("content_source", e.target.value)}
                        placeholder="Paste your study material, notes, or content that you want the quiz to be based on..."
                        rows={6}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 resize-vertical text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional_instructions" className="text-gray-300">Additional Instructions (Optional)</Label>
                      <textarea
                        id="additional_instructions"
                        value={form.additional_instructions}
                        onChange={(e) => updateForm("additional_instructions", e.target.value)}
                        placeholder="Any specific instructions for the AI (e.g., 'Focus on practical examples', 'Include code snippets', etc.)"
                        rows={3}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 resize-vertical"
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-4 sm:pt-6 border-t border-gray-700">
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={isGenerating || !user}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Generating Quiz...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Generate AI Quiz</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-blue-300">Pro Tips</h3>
                  <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                    <li>• Provide detailed content for more accurate questions</li>
                    <li>• Mix question types for better learning experience</li>
                    <li>• Use specific additional instructions for targeted results</li>
                    <li>• Start with 10-15 questions for optimal quiz length</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
