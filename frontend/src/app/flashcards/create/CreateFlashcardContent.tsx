"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { NumericFormat } from "react-number-format";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
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
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useCurrentUser, useTopics } from "@/hooks/useDatabase";
import { useGenerateAIFlashcards } from "@/hooks/useBackendFlashcards";
import { toast } from "react-hot-toast";

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

export default function CreateFlashcardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useBackendAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: topics = [], isLoading: topicsLoading } = useTopics();
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
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

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
  const isLoading = authLoading || (user && userLoading) || topicsLoading;

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
        userId: currentUser.user_id,
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <Brain className="mx-auto h-16 w-16 text-blue-200" />
              </motion.div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Create AI-Powered
                <span className="block text-blue-200">Flashcards</span>
              </h1>
              <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
                Transform any topic into engaging flashcards with our advanced AI. 
                Perfect for studying, learning, and mastering new concepts.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Form Section */}
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, y: 20 }}
              animate={formInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Generate Your Flashcards
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose a topic, set your preferences, and let AI create personalized flashcards for you.
                </p>
              </div>

              <div className="space-y-6">
                {/* Topic Selection */}
                <div>
                  <Label htmlFor="topic" className="text-base font-semibold text-gray-700 mb-3 block">
                    Topic
                  </Label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Existing Topics */}
                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">
                        Select from existing topics
                      </Label>
                      <Select
                        value={topics.find((t: any) => t.topic_id === form.topic_id) || null}
                        onChange={(option: any) => handleTopicSelection(option?.topic_id || "")}
                        options={topics}
                        getOptionLabel={(option: any) => option.name}
                        getOptionValue={(option: any) => option.topic_id}
                        placeholder="Choose a topic..."
                        className="text-sm"
                        isClearable
                      />
                    </div>

                    {/* Custom Topic */}
                    <div>
                      <Label htmlFor="custom_topic" className="text-sm font-medium text-gray-600 mb-2 block">
                        Or enter a custom topic
                      </Label>
                      <Input
                        id="custom_topic"
                        type="text"
                        placeholder="e.g., Machine Learning Basics, French Vocabulary..."
                        value={form.custom_topic}
                        onChange={(e) => handleCustomTopic(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Number of Flashcards */}
                <div>
                  <Label htmlFor="num_flashcards" className="text-base font-semibold text-gray-700 mb-3 block">
                    Number of Flashcards
                  </Label>
                  <NumericFormat
                    customInput={Input}
                    value={form.num_flashcards}
                    onValueChange={(values) => updateForm("num_flashcards", parseInt(values.value) || 10)}
                    allowNegative={false}
                    min={1}
                    max={50}
                    placeholder="10"
                    className="w-32"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Choose between 1 and 50 flashcards
                  </p>
                </div>

                {/* Difficulty Level */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">
                    Difficulty Level
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateForm("difficulty", level.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          form.difficulty === level.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${level.color}`}>
                            {level.value}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {level.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleGenerateFlashcards}
                    disabled={isGenerating}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Flashcards...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Flashcards
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Success Message */}
            {generatedFlashcards && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
              >
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Flashcards Generated Successfully!
                  </h3>
                  <p className="text-green-700 mb-4">
                    {generatedFlashcards.generated_count} flashcards created for "{generatedFlashcards.topic_name}"
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => router.push(`/flashcards/study/${generatedFlashcards.topic_id}`)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Start Studying
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Create More
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tips Section */}
            <motion.div
              ref={tipsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={tipsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Tips for Better Flashcards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Be Specific</h4>
                  <p className="text-gray-600 text-sm">
                    Choose focused topics for more targeted learning
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Start Small</h4>
                  <p className="text-gray-600 text-sm">
                    Begin with 5-10 cards and gradually increase
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Rocket className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Practice Regularly</h4>
                  <p className="text-gray-600 text-sm">
                    Review your flashcards consistently for best results
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
