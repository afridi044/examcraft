"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useCreateBackendNote } from "@/hooks/useBackendNotes";
import { useBackendParentTopics } from "@/hooks/useBackendTopics";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageLoading } from "@/components/ui/loading";
import { SuccessScreen } from "@/components/ui/SuccessScreen";
import { FormCard, FormHeader, FormSection, TipsCard } from "@/components/ui/form-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubtopicAutocomplete } from "@/components/ui/subtopic-autocomplete";
import {
  BookOpen,
  Sparkles,
  FileText,
  Save,
  ArrowLeft,
  Lightbulb,
  Target,
  Zap,
  Star,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Confetti from "react-confetti";

interface NoteForm {
  title: string;
  content: string;
  topic_id: string;
  subtopic_name: string;
}

const DEFAULT_FORM: NoteForm = {
  title: "",
  content: "",
  topic_id: "",
  subtopic_name: "",
};



export default function CreateNotePage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const createNoteMutation = useCreateBackendNote();
  const { data: topics = [], isLoading: topicsLoading } = useBackendParentTopics();

  // Scroll to top when navigating
  useScrollToTop();

  // Intersection observer for scroll animations
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [formRef, formInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [tipsRef, tipsInView] = useInView({ threshold: 0.1, triggerOnce: true });

  const [form, setForm] = useState<NoteForm>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdNote, setCreatedNote] = useState<{
    note_id: string;
    title: string;
    word_count: number;
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

  // EARLY REDIRECT: Check authentication immediately
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

  // Loading state
  if (userLoading || topicsLoading) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Create Note"
          subtitle="Preparing your note creation form..."
          variant="dashboard"
        />
      </DashboardLayout>
    );
  }

  const updateForm = (field: keyof NoteForm, value: string) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };

      // Enforce mutual exclusivity between topic_id and subtopic_name
      if (field === 'topic_id' && value) {
        // If selecting an existing topic, clear subtopic
        newForm.subtopic_name = '';
      } else if (field === 'subtopic_name' && value) {
        // If entering a subtopic, ensure we have a parent topic selected
        // Don't clear topic_id as it's required for subtopics
      }

      return newForm;
    });
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title for your note");
      return false;
    }
    if (!form.content.trim()) {
      toast.error("Please enter content for your note");
      return false;
    }
    if (form.content.trim().split(/\s+/).filter(word => word.length > 0).length < 5) {
      toast.error("Please enter at least 5 words in your note");
      return false;
    }
    
    // Check topic selection logic
    const hasTopicId = !!form.topic_id;
    const hasSubtopic = !!form.subtopic_name.trim();
    
    // Must have topic_id, and optionally subtopic_name
    if (!hasTopicId) {
      toast.error("Please select a topic");
      return false;
    }
    
    if (hasSubtopic && !hasTopicId) {
      toast.error("Please select a parent topic when entering a subtopic");
      return false;
    }
    
    return true;
  };

  const handleCreateNote = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      let topicName = '';
      
      if (form.subtopic_name.trim()) {
        // Using subtopic - topic will be parent topic name + subtopic
        const parentTopic = topics?.find((t: any) => t.topic_id === form.topic_id);
        topicName = parentTopic ? `${parentTopic.name} - ${form.subtopic_name.trim()}` : form.subtopic_name.trim();
      } else if (form.topic_id) {
        // Using existing topic
        topicName = topics?.find((t: any) => t.topic_id === form.topic_id)?.name || '';
      }

      const result = await createNoteMutation.mutateAsync({
        title: form.title.trim(),
        content: form.content.trim(),
        topic_id: form.topic_id,
        subtopic_name: form.subtopic_name.trim() || undefined,
        topic_name: topicName || undefined,
      });
      
      if (result) {
        setCreatedNote({
          note_id: result.note_id,
          title: form.title.trim(),
          word_count: form.content.trim().split(/\s+/).filter(word => word.length > 0).length,
        });
      }
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      toast.success("Note created successfully!");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setCreatedNote(null);
  };

  const navigateToLibrary = () => {
    router.push("/library?tab=notes");
  };

  const wordCount = form.content.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = form.content.length;

  if (createdNote) {
    return (
      <DashboardLayout>
        <AnimatePresence>
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              colors={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']}
            />
          )}
        </AnimatePresence>
        
        <SuccessScreen
          icon={<BookOpen className="h-12 w-12 text-white" />}
          title="Note Created Successfully!"
          subtitle={`"${createdNote.title}" has been saved to your library`}
          details={{
            title: "Note Statistics",
            stats: [
              { icon: <FileText className="h-4 w-4" />, label: "Words", value: createdNote.word_count.toString(), color: "text-blue-400" },
              { icon: <Target className="h-4 w-4" />, label: "Characters", value: charCount.toString(), color: "text-purple-400" },
            ],
          }}
          primaryAction={{
            label: "Create Another Note",
            onClick: resetForm,
            icon: <Sparkles className="h-4 w-4" />,
          }}
          secondaryActions={[
            {
              label: "Go to Library",
              onClick: navigateToLibrary,
              icon: <ArrowLeft className="h-4 w-4" />,
            },
          ]}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: -30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <FormHeader
              title="Create Study Note"
              description="Capture your insights, organize your learning, and build your knowledge base with beautiful, structured notes."
              icon={<BookOpen className="h-6 w-6 text-white" />}
              iconBgClass="from-green-500 to-emerald-600"
              titleGradient="from-green-400 via-emerald-400 to-teal-400"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <motion.div
                ref={formRef}
                initial={{ opacity: 0, y: 30 }}
                animate={formInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <FormCard className="bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 transition-all duration-300">
                  <FormSection title="Note Details" icon={<FileText className="h-5 w-5" />}>
                    <div className="space-y-6">
                      {/* Title Input */}
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                          Title *
                        </Label>
                        <Input
                          id="title"
                          value={form.title}
                          onChange={(e) => updateForm("title", e.target.value)}
                          placeholder="Enter a descriptive title for your note..."
                          className="h-12 bg-slate-800/80 border-slate-600/50 text-white placeholder:text-gray-400 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl transition-all duration-200"
                          required
                        />
                      </div>

                      {/* Topic Selection */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="topic" className="text-sm font-medium text-gray-300">
                            Topic *
                          </Label>
                          <Select
                            value={form.topic_id}
                            onValueChange={(value) => updateForm("topic_id", value)}
                          >
                            <SelectTrigger className="h-12 bg-slate-800/80 border-slate-600/50 text-white focus:border-green-500/50 focus:ring-green-500/20 rounded-xl transition-all duration-200">
                              <SelectValue placeholder="Choose a topic..." />
                            </SelectTrigger>
                            <SelectContent>
                              {topics?.map((topic: any) => (
                                <SelectItem key={topic.topic_id} value={topic.topic_id}>
                                  {topic.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <SubtopicAutocomplete
                            value={form.subtopic_name}
                            onChange={(value) => updateForm("subtopic_name", value)}
                            parentTopicId={form.topic_id}
                            placeholder="e.g., React Hooks"
                          />
                        </div>
                      </div>
                      
                      {(form.topic_id || form.subtopic_name) && (
                        <div className="text-xs p-2 rounded border transition-colors text-gray-400 bg-slate-700/30 border-slate-600">
                          <span className="font-medium">
                            Note:
                          </span>
                          You can select a parent topic and optionally enter a subtopic to create more focused notes.
                        </div>
                      )}

                      {/* Content Input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="content" className="text-sm font-medium text-gray-300">
                            Content *
                          </Label>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {wordCount} word{wordCount !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {charCount} char{charCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <Textarea
                          id="content"
                          value={form.content}
                          onChange={(e) => updateForm("content", e.target.value)}
                          placeholder="Write your study notes here... Include key concepts, formulas, definitions, examples, and any important information you want to remember. You can use bullet points, numbered lists, or paragraphs to organize your thoughts."
                          className="min-h-[400px] bg-slate-800/80 border-slate-600/50 text-white placeholder:text-gray-400 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl resize-none transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-8 border-t border-slate-700/50">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.back()}
                      className="text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleCreateNote}
                      disabled={isSubmitting || !form.title.trim() || !form.content.trim()}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          Create Note
                        </div>
                      )}
                    </Button>
                  </div>
                </FormCard>
              </motion.div>
            </div>

            {/* Tips Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                ref={tipsRef}
                initial={{ opacity: 0, x: 30 }}
                animate={tipsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6"
              >


                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Words</span>
                        <span className="text-sm font-medium text-blue-300">{wordCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Characters</span>
                        <span className="text-sm font-medium text-purple-300">{charCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Lines</span>
                        <span className="text-sm font-medium text-green-300">{form.content.split('\n').length}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Pro Tips</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Use clear headings and subheadings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Include examples and real-world applications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Add personal insights and connections</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
} 