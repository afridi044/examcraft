"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useBackendTopics } from "@/hooks/useBackendTopics";
import { useTheme } from "@/contexts/ThemeContext";
import { quizService } from "@/lib/services";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FormButton } from "@/components/ui/form-components";
import { PageLoading } from "@/components/ui/loading";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import {
  Brain,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  Users,
  FileText,
  Zap,
  Star,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Confetti from "react-confetti";

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
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const { isDark } = useTheme();
  const { data: topics = [], isLoading: topicsLoading } = useBackendTopics() as { data: Array<{ topic_id: string; name: string }>, isLoading: boolean };

  // Intersection observer for scroll animations
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [formRef, formInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [tipsRef, tipsInView] = useInView({ threshold: 0.1, triggerOnce: true });

  const [form, setForm] = useState<QuizForm>(DEFAULT_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<{
    quiz_id: string;
    title: string;
    num_questions: number;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Window size for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Redirect if not authenticated
  // EARLY REDIRECT: Check authentication immediately after render
  useEffect(() => {
    if (!userLoading && !currentUser) {
      setSignOutMessage();
      router.push("/auth/signin");
    }
  }, [userLoading, currentUser, router, setSignOutMessage]);

  // Don't render anything while redirecting
  if (!userLoading && !currentUser) {
    return null;
  }

  // Simple loading check
  const isLoading = userLoading || topicsLoading;

  const updateForm = (field: keyof QuizForm, value: string | number) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };

      // Enforce mutual exclusivity between topic_id and custom_topic
      if (field === 'topic_id' && value) {
        // If selecting an existing topic, clear custom topic
        newForm.custom_topic = '';
      } else if (field === 'custom_topic' && value) {
        // If entering a custom topic, clear existing topic selection
        newForm.topic_id = '';
      }

      return newForm;
    });
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
    if (form.topic_id && form.custom_topic.trim()) {
      toast.error("Please select either an existing topic OR enter a custom topic, not both");
      return false;
    }
    // Number of questions validation is no longer needed since we use predefined options
    // The Select component ensures only valid values (5-50) can be selected
    return true;
  };

  const handleGenerateQuiz = async () => {
    if (!validateForm() || !currentUser) return;

    setIsGenerating(true);
    try {
      const topic = form.topic_id
        ? topics?.find((t: { topic_id: string; name: string }) => t.topic_id === form.topic_id)?.name || form.custom_topic
        : form.custom_topic;

      const response = await quizService.generateQuiz({
        title: form.title || `${topic} Quiz`,
        description: form.description || `AI-generated quiz on ${topic}`,
        topic,
        difficulty: form.difficulty === 1 ? 'easy' : form.difficulty <= 3 ? 'medium' : 'hard',
        questionCount: form.num_questions,
        topicId: form.topic_id,
        customTopic: form.custom_topic,
        contentSource: form.content_source,
        additionalInstructions: form.additional_instructions,
      });

      if (!response.success || !response.data?.quiz) {
        throw new Error(response.error || "Failed to generate quiz");
      }

      toast.success("Quiz generated successfully!");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

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
    router.push("/dashboard");
  };

  // Loading screen
  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Quiz Creator..."
          subtitle="Preparing your AI-powered quiz generator"
          variant="quiz"
        />
      </DashboardLayout>
    );
  }

  // Success screen
  if (generatedQuiz) {
    return (
      <DashboardLayout>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            colors={['#a21caf', '#f472b6', '#6366f1', '#f59e42', '#10b981']}
          />
        )}
        
        {/* Compact Premium Success Screen */}
        <SuccessScreen
          title="Quiz Generated Successfully!"
          subtitle="Your AI-powered quiz has been created and is ready to take."
          icon={<Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-lg" />}
          iconColor="green"
          details={{
            title: generatedQuiz.title,
            stats: [
              {
                icon: <FileText className="h-4 w-4" />,
                label: "Questions",
                value: generatedQuiz.num_questions.toString(),
                color: "text-green-400"
              },
              {
                icon: <Clock className="h-4 w-4" />,
                label: "min",
                value: `~${Math.ceil(generatedQuiz.num_questions * 1.5)}`,
                color: "text-blue-400"
              }
            ]
          }}
          primaryAction={{
            label: "Take Quiz Now",
            onClick: () => router.push(`/quiz/take/${generatedQuiz.quiz_id}`),
            icon: <Zap className="h-5 w-5" />
          }}
          secondaryActions={[
            {
              label: "Dashboard",
              onClick: navigateToDashboard,
              icon: <Users className="h-4 w-4" />
            },
            {
              label: "Create More",
              onClick: resetForm,
              icon: <Brain className="h-4 w-4" />
            }
          ]}
          showConfetti={showConfetti}
        />
      </DashboardLayout>
    );
  }

  // Main form
  return (
    <DashboardLayout>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#a21caf', '#f472b6', '#6366f1', '#f59e42', '#10b981']}
        />
      )}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-2"
        >
          <motion.div
            className="flex items-center justify-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30"
              whileHover={{
                boxShadow: "0 20px 25px -5px rgba(168, 85, 247, 0.4)",
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Quiz Generator
            </h1>
          </motion.div>
          <motion.p
            className="text-gray-400 max-w-2xl mx-auto px-4 text-sm"
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create personalized multiple-choice quizzes with AI. Provide your topic and content, and our AI will generate engaging MCQ questions tailored to your needs.
          </motion.p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 30 }}
          animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50 p-4 sm:p-5 lg:p-6 backdrop-blur-sm">
            <div className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
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
                <div className="space-y-4 mt-4">
                  <Label className="text-gray-300">Topic</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm text-gray-400 flex items-center space-x-2">
                        <span>Select from existing topics</span>
                        {form.custom_topic && (
                          <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                            Will clear custom topic
                          </span>
                        )}
                      </Label>
                      <Select
                        value={form.topic_id}
                        onValueChange={(value) => updateForm("topic_id", value)}
                      >
                        <SelectTrigger className={`transition-colors ${form.custom_topic
                          ? 'border-orange-400/50 bg-orange-400/5'
                          : 'border-gray-600'
                          }`}>
                          <SelectValue placeholder="Choose a topic..." />
                        </SelectTrigger>
                        <SelectContent>
                          {topics?.map((topic) => (
                            <SelectItem key={topic.topic_id} value={topic.topic_id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom_topic" className="text-sm text-gray-400 flex items-center space-x-2">
                        <span>Or enter custom topic</span>
                        {form.topic_id && (
                          <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                            Will clear selection
                          </span>
                        )}
                      </Label>
                      <Input
                        id="custom_topic"
                        value={form.custom_topic}
                        onChange={(e) => updateForm("custom_topic", e.target.value)}
                        placeholder="e.g., React Hooks"
                        className={`bg-gray-700/50 border text-white placeholder:text-gray-400 transition-colors ${form.topic_id
                          ? 'border-orange-400/50 bg-orange-400/5'
                          : 'border-gray-600'
                          }`}
                      />
                    </div>
                  </div>
                  {(form.topic_id || form.custom_topic) && (
                    <div className={`text-xs p-2 rounded border transition-colors ${form.topic_id && form.custom_topic.trim()
                      ? 'text-red-400 bg-red-400/10 border-red-400/30'
                      : 'text-gray-400 bg-gray-700/30 border-gray-600'
                      }`}>
                      <span className="font-medium">
                        {form.topic_id && form.custom_topic.trim() ? 'Error:' : 'Note:'}
                      </span>
                      {form.topic_id && form.custom_topic.trim()
                        ? ' You cannot select both an existing topic and enter a custom topic. Please choose one option.'
                        : ' You can only select one option - either an existing topic or a custom topic.'
                      }
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quiz Configuration */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Quiz Configuration</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Difficulty Level */}
                  <div className="space-y-4">
                    <Label className="text-gray-300 flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Difficulty Level</span>
                    </Label>
                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      {DIFFICULTY_LEVELS.map((level, index) => (
                        <motion.button
                          key={level.value}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={formInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                          whileHover={{
                            scale: 1.05,
                            y: -2,
                            boxShadow: form.difficulty === level.value
                              ? "0 10px 25px -5px rgba(147, 51, 234, 0.4)"
                              : "0 10px 25px -5px rgba(0, 0, 0, 0.2)"
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateForm("difficulty", level.value)}
                          className={`p-2 sm:p-3 rounded-lg border text-center transition-all min-h-[44px] ${form.difficulty === level.value
                            ? "border-purple-500 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/25"
                            : "border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500"
                            }`}
                        >
                          <div className="text-sm font-medium">{level.value}</div>
                          <div className={`text-xs ${level.color}`}>{level.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  {/* Number of Questions */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <Label htmlFor="num_questions" className="text-gray-300">Number of Questions</Label>
                    <div className="mt-2">
                      <Select
                        value={form.num_questions.toString()}
                        onValueChange={(value) => updateForm("num_questions", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="40">40</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Content & Instructions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
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
              </motion.div>

              {/* Generate Button */}
              <motion.div
                className="pt-4 sm:pt-6 border-t border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div>
                  <FormButton
                    onClick={handleGenerateQuiz}
                    disabled={isGenerating || !currentUser}
                    isLoading={isGenerating}
                    loadingIcon={<Loader2 className="h-5 w-5 animate-spin" />}
                    loadingText="Generating Quiz..."
                    icon={<Sparkles className="h-5 w-5" />}
                    text="Generate AI Quiz"
                    gradientFrom="purple"
                    gradientTo="pink"
                  />
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
        {/* Tips Card */}
        <motion.div
          ref={tipsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={tipsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.3, delay: 0.0 }}
        >
          <div>
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div
                  className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                >
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="space-y-2">
                  <motion.h3
                    className={`text-base sm:text-lg font-bold flex items-center space-x-2 ${
                      isDark ? 'text-blue-300' : 'text-blue-600'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={tipsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <span>Pro Tips</span>
                  </motion.h3>
                  <motion.ul
                    className={`text-sm space-y-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={tipsInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    {[
                      "Provide detailed content for more accurate questions",
                      "Mix question types for better learning experience",
                      "Use specific additional instructions for targeted results",
                      "Start with 10-15 questions for optimal quiz length"
                    ].map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={tipsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                        whileHover={{ x: 5, color: "#6366f1" }}
                        className="transition-colors duration-200"
                      >
                        • {tip}
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
