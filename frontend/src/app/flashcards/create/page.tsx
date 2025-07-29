"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { NumericFormat } from "react-number-format";
import { motion, AnimatePresence } from "framer-motion";
import ReactSelect from "react-select";
import Confetti from "react-confetti";
import { useInView } from "react-intersection-observer";

import {
  Brain,
  Loader2,
  Sparkles,
  BookOpen,
  FileText,
  Zap,
  Users,
  Layers,
  Lightbulb,
  Rocket,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useBackendTopics } from "@/hooks/useBackendTopics";
import { useTheme } from "@/contexts/ThemeContext";
import { useGenerateAIFlashcards } from "@/hooks/useBackendFlashcards";
import { PageLoading } from "@/components/ui/loading";
import { toast } from "react-hot-toast";
import { SuccessScreen } from "@/components/ui/SuccessScreen";

interface FlashcardForm {
  topic_id: string;
  custom_topic: string;
  num_flashcards: number;
  difficulty: number;
  content_source: string;
  additional_instructions: string;
}

const DEFAULT_FORM: FlashcardForm = {
  topic_id: "",
  custom_topic: "",
  num_flashcards: 10,
  difficulty: 3,
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

// Component that uses searchParams - wrapped in Suspense
function CreateFlashcardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const { isDark } = useTheme();
  const { data: topics = [], isLoading: topicsLoading } = useBackendTopics();
  const generateAIFlashcards = useGenerateAIFlashcards();

  // Scroll to top when navigating
  useScrollToTop();

  // Get preselected topic from URL params
  const preselectedTopicId = searchParams?.get("topic_id") || "";

  const [form, setForm] = useState<FlashcardForm>({
    ...DEFAULT_FORM,
    topic_id: preselectedTopicId,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<{
    topic_id: string;
    topic_name: string;
    generated_count: number;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Intersection observer for scroll animations
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [formRef, formInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [tipsRef, tipsInView] = useInView({ threshold: 0.1, triggerOnce: true });

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

  // Set initial topic if preselected
  useEffect(() => {
    if (preselectedTopicId && topics.length > 0) {
      const selectedTopic = topics.find((t: any) => t.topic_id === preselectedTopicId);
      if (selectedTopic && !form.topic_id) {
        setForm(prev => ({ ...prev, topic_id: preselectedTopicId }));
      }
    }
  }, [preselectedTopicId, topics, form.topic_id]);



  // Simple loading check
  const isLoading = userLoading || topicsLoading;

  const updateForm = (field: keyof FlashcardForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const getTopicName = () => {
    if (form.topic_id) {
      return topics?.find((t: any) => t.topic_id === form.topic_id)?.name || "";
    }
    return form.custom_topic.trim();
  };

  const validateForm = () => {
    const topicName = getTopicName();
    if (!topicName) {
      toast.error("Please select a topic or enter a custom topic");
      return false;
    }
    if (form.num_flashcards < 1 || form.num_flashcards > 50) {
      toast.error("Number of flashcards must be between 1 and 50");
      return false;
    }
    return true;
  };

  const handleGenerateFlashcards = async () => {
    if (!validateForm() || !currentUser) return;

    setIsGenerating(true);
    try {
      const topicName = getTopicName();
      const difficultyMap = { 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' } as const;
      const difficulty = difficultyMap[form.difficulty as keyof typeof difficultyMap] || 'medium';

      const result = await generateAIFlashcards.mutateAsync({
        topic: topicName,
        count: form.num_flashcards,
        difficulty,
        topicId: form.topic_id || undefined,
      });

      toast.success(`Successfully generated ${result.length} flashcard${result.length !== 1 ? "s" : ""}!`);

      // Trigger confetti celebration
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      setGeneratedFlashcards({
        topic_id: form.topic_id || 'general',
        topic_name: topicName,
        generated_count: result.length,
      });
    } catch (error) {
      console.error("AI flashcard generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setGeneratedFlashcards(null);
    setForm(DEFAULT_FORM);
  };

  const handleTopicSelection = (topicId: string) => {
    updateForm("topic_id", topicId);
    updateForm("custom_topic", "");
  };

  const handleCustomTopic = (customTopic: string) => {
    updateForm("custom_topic", customTopic);
    updateForm("topic_id", "");
  };

  // React Select options and styling
  const topicOptions = topics.map((topic: any) => ({
    value: topic.topic_id,
    label: topic.name,
    icon: <BookOpen className="w-4 h-4" />
  }));

  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'rgba(55, 65, 81, 0.5)',
      borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
      borderWidth: '1px',
      borderRadius: '0.5rem',
      minHeight: '44px',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#6b7280'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#4b5563' : 'transparent',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#4b5563'
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#ffffff'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af'
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#ffffff'
    })
  };

  // Loading screen
  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Flashcard Creator"
          subtitle="Preparing your learning tools"
          variant="flashcard"
        />
      </DashboardLayout>
    );
  }

  // Success screen
  if (generatedFlashcards) {
    return (
      <DashboardLayout>
        <SuccessScreen
          title="Flashcards Generated Successfully!"
          subtitle="Your AI-powered flashcards have been created and are ready for study."
          icon={<Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-lg" />}
          iconColor="blue"
          details={{
            title: generatedFlashcards.topic_name,
            stats: [
              {
                icon: <Layers className="h-4 w-4" />,
                label: "Flashcards",
                value: form.num_flashcards.toString(),
                color: "text-blue-400"
              },
              {
                icon: <Brain className="h-4 w-4" />,
                label: "AI Generated",
                value: "",
                color: "text-purple-400"
              }
            ]
          }}
          primaryAction={{
            label: "Start Studying Now",
            onClick: () => router.push("/flashcards"),
            icon: <Zap className="h-5 w-5" />
          }}
          secondaryActions={[
            {
              label: "Dashboard",
              onClick: () => router.push("/dashboard"),
              icon: <Users className="h-4 w-4" />
            },
            {
              label: "Create More",
              onClick: resetForm,
              icon: <Layers className="h-4 w-4" />
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
          colors={['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b']}
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
              className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
              whileHover={{
                boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.4)",
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.6 }}
            >
              <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              AI Flashcard Generator
            </h1>
          </motion.div>
          <motion.p
            className={`max-w-2xl mx-auto px-4 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create personalized flashcards with AI. Provide your topic and content, and our AI will generate effective study materials optimized for active recall.
          </motion.p>


        </motion.div>

        {/* Main Form */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 30 }}
          animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div>
            <Card className={`${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
            } p-4 sm:p-5 lg:p-6 backdrop-blur-sm`}>
              <div className="space-y-4 sm:space-y-6">
                {/* Topic Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <h2 className={`text-lg sm:text-xl font-bold ${
                      isDark ? 'text-white' : 'text-blue-900'
                    }`}>Topic Selection</h2>
                  </div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Label className={`${
                      isDark ? 'text-gray-300' : 'text-blue-800'
                    }`}>Topic</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="topic" className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-blue-600'
                        }`}>Select from existing topics</Label>
                        <ReactSelect
                          id="topic"
                          options={topicOptions}
                          value={topicOptions.find((option: any) => option.value === form.topic_id) || null}
                          onChange={(selectedOption) => {
                            handleTopicSelection(selectedOption?.value || "");
                          }}
                          styles={selectStyles}
                          placeholder="Choose a topic..."
                          isClearable
                          isSearchable
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom_topic" className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-blue-600'
                        }`}>Or enter custom topic</Label>
                        <div>
                          <Input
                            id="custom_topic"
                            value={form.custom_topic}
                            onChange={(e) => handleCustomTopic(e.target.value)}
                            placeholder="e.g., Machine Learning Basics"
                            className={`min-h-[44px] transition-all duration-200 ${
                              isDark 
                                ? 'bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400' 
                                : 'bg-white border-blue-300 text-blue-900 placeholder:text-blue-400'
                            }`}
                            disabled={!!form.topic_id}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Flashcard Configuration */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <h2 className={`text-lg sm:text-xl font-bold ${
                      isDark ? 'text-white' : 'text-green-800'
                    }`}>Flashcard Configuration</h2>
                  </div>

                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {/* Difficulty Level */}
                    <div className="space-y-4">
                      <Label className={`flex items-center space-x-2 ${
                        isDark ? 'text-gray-300' : 'text-green-800'
                      }`}>
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
                                ? "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                                : "0 10px 25px -5px rgba(0, 0, 0, 0.2)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateForm("difficulty", level.value)}
                            className={`p-2 sm:p-3 rounded-lg border text-center transition-all min-h-[44px] ${form.difficulty === level.value
                              ? isDark 
                                ? "border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/25"
                                : "border-blue-500 bg-blue-100 text-blue-700 shadow-lg shadow-blue-500/25"
                              : isDark
                                ? "border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500"
                                : "border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                          >
                            <div className="text-sm font-medium">{level.value}</div>
                            <div className={`text-xs ${level.color}`}>{level.label}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Flashcards */}
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={formInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <Label htmlFor="num_flashcards" className={`flex items-center space-x-2 ${
                        isDark ? 'text-gray-300' : 'text-green-800'
                      }`}>
                        <Layers className="w-4 h-4 " />
                        <span>Number of Flashcards (1-50)</span>
                      </Label>
                      <div className="py-2">
                        <NumericFormat
                          id="num_flashcards"
                          value={form.num_flashcards}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            if (floatValue !== undefined && floatValue >= 1 && floatValue <= 50) {
                              updateForm("num_flashcards", floatValue);
                            }
                          }}
                          allowNegative={false}
                          decimalScale={0}
                          fixedDecimalScale={false}
                          thousandSeparator={false}
                          isAllowed={(values) => {
                            const { floatValue } = values;
                            return floatValue === undefined || (floatValue >= 1 && floatValue <= 50);
                          }}
                          customInput={Input}
                          className={`min-h-[44px] text-center font-medium text-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600 text-white' 
                              : 'bg-white border-green-300 text-green-900'
                          }`}
                          placeholder="10"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Content Source */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="h-8 w-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <h2 className={`text-lg sm:text-xl font-bold ${
                      isDark ? 'text-white' : 'text-teal-800'
                    }`}>Content & Instructions</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content_source" className={`${
                        isDark ? 'text-gray-300' : 'text-teal-800'
                      }`}>Content Source (Optional)</Label>
                      <textarea
                        id="content_source"
                        value={form.content_source}
                        onChange={(e) => updateForm("content_source", e.target.value)}
                        placeholder="Paste your study material, notes, or content that you want the flashcards to be based on..."
                        rows={4}
                        className={`w-full p-3 rounded-lg resize-vertical min-h-[100px] ${
                          isDark 
                            ? 'bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400' 
                            : 'bg-white border border-teal-300 text-teal-900 placeholder:text-teal-400'
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional_instructions" className={`${
                        isDark ? 'text-gray-300' : 'text-teal-800'
                      }`}>Additional Instructions (Optional)</Label>
                      <textarea
                        id="additional_instructions"
                        value={form.additional_instructions}
                        onChange={(e) => updateForm("additional_instructions", e.target.value)}
                        placeholder="Any specific instructions for the AI (e.g., 'Focus on definitions', 'Include examples', etc.)"
                        rows={3}
                        className={`w-full p-3 rounded-lg resize-vertical min-h-[80px] ${
                          isDark 
                            ? 'bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400' 
                            : 'bg-white border border-teal-300 text-teal-900 placeholder:text-teal-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <motion.div
                  className="pt-4 sm:pt-6 border-t border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <div>
                    <Button
                      onClick={handleGenerateFlashcards}
                      disabled={isGenerating || !currentUser}
                      className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-base sm:text-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                    >
                      <AnimatePresence mode="wait">
                        {isGenerating ? (
                          <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-2"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-5 w-5" />
                            </motion.div>
                            <span>Generating Flashcards...</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="generate"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-2"
                          >
                            <div>
                              <Sparkles className="h-5 w-5" />
                            </div>
                            <span>Generate AI Flashcards</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          ref={tipsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={tipsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.4, delay: 0.0 }}
        >
          <div>
            <Card className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-teal-500/20 p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div
                  className="h-8 w-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                >
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div className="space-y-2">
                  <motion.h3
                    className={`text-base sm:text-lg font-bold flex items-center space-x-2 ${
                      isDark ? 'text-teal-300' : 'text-teal-600'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={tipsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <Rocket className="w-4 h-4" />
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
                      "Provide detailed content for more accurate flashcards",
                      "Use specific topics for better targeted learning",
                      "Include clear instructions for optimal AI generation",
                      "Start with 10-15 flashcards for effective study sessions"
                    ].map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={tipsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                        whileHover={{ x: 5, color: "#14b8a6" }}
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

// Loading component for Suspense fallback
function CreateFlashcardLoading() {
  return (
    <DashboardLayout>
      <PageLoading
        title="Loading Create Flashcard"
        subtitle="Preparing your flashcard creation workspace"
        variant="flashcard"
      />
    </DashboardLayout>
  );
}

// Main export with Suspense boundary
export default function CreateFlashcardPage() {
  return (
    <Suspense fallback={<CreateFlashcardLoading />}>
      <CreateFlashcardContent />
    </Suspense>
  );
}
