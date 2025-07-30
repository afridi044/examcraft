"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Sparkles,
  Brain,
  Loader2,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useBackendParentTopics } from "@/hooks/useBackendTopics";
import { useCreateFlashcard, useGenerateAIFlashcards } from "@/hooks/useBackendFlashcards";
import { toast } from "react-hot-toast";

interface CreateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedTopicId?: string;
}

type CreationMode = "manual" | "ai";

interface ManualFlashcardForm {
  question: string;
  answer: string;
  topic_id: string;
  custom_topic: string;
}

interface AIFlashcardForm {
  topic_id: string;
  custom_topic: string;
  topic_name: string;
  num_flashcards: number;
  difficulty: "easy" | "medium" | "hard";
  content_source: string;
  additional_instructions: string;
}

export function CreateFlashcardModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedTopicId = "",
}: CreateFlashcardModalProps) {
  const { user: currentUser } = useBackendAuth();
  const { data: topics } = useBackendParentTopics();
  const createFlashcardMutation = useCreateFlashcard();
  const generateAIFlashcardsMutation = useGenerateAIFlashcards();

  const [creationMode, setCreationMode] = useState<CreationMode>("manual");
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [manualForm, setManualForm] = useState<ManualFlashcardForm>({
    question: "",
    answer: "",
    topic_id: preselectedTopicId,
    custom_topic: "",
  });

  const [aiForm, setAIForm] = useState<AIFlashcardForm>({
    topic_id: preselectedTopicId,
    custom_topic: "",
    topic_name: "",
    num_flashcards: 5,
    difficulty: "medium",
    content_source: "",
    additional_instructions: "",
  });

  // Reset forms when modal opens
  useEffect(() => {
    if (isOpen) {
      setManualForm({
        question: "",
        answer: "",
        topic_id: preselectedTopicId,
        custom_topic: "",
      });
      setAIForm({
        topic_id: preselectedTopicId,
        custom_topic: "",
        topic_name: "",
        num_flashcards: 5,
        difficulty: "medium",
        content_source: "",
        additional_instructions: "",
      });
      setCreationMode("manual");
    }
  }, [isOpen, preselectedTopicId]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please log in to create flashcards");
      return;
    }

    if (!manualForm.question.trim() || !manualForm.answer.trim()) {
      toast.error("Please fill in both question and answer");
      return;
    }

    if (!manualForm.topic_id && !manualForm.custom_topic.trim()) {
      toast.error("Please select or create a topic");
      return;
    }

    try {
      await createFlashcardMutation.mutateAsync({
        question: manualForm.question.trim(),
        answer: manualForm.answer.trim(),
        topic_id: manualForm.topic_id || undefined,
        custom_topic: manualForm.custom_topic.trim() || undefined,
      });

      toast.success("Flashcard created successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Create flashcard error:", error);
      toast.error(error?.message || "Failed to create flashcard");
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please log in to generate flashcards");
      return;
    }

    if (!aiForm.topic_id && !aiForm.custom_topic.trim()) {
      toast.error("Please select or create a topic");
      return;
    }

    if (!aiForm.content_source.trim()) {
      toast.error("Please provide content source for AI generation");
      return;
    }

    setIsGenerating(true);

    try {
      const topicName = aiForm.topic_id
        ? topics?.find((t: any) => t.topic_id === aiForm.topic_id)?.name
        : aiForm.custom_topic;

      await generateAIFlashcardsMutation.mutateAsync({
        topicId: aiForm.topic_id || undefined,
        topic: aiForm.topic_id
          ? topics?.find((t: any) => t.topic_id === aiForm.topic_id)?.name || ""
          : aiForm.custom_topic.trim(),
        count: aiForm.num_flashcards,
        difficulty: aiForm.difficulty,
      });

      toast.success(`Generated ${aiForm.num_flashcards} flashcards successfully!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Generate AI flashcards error:", error);
      toast.error(error?.message || "Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Flashcards</DialogTitle>
          <p className="text-gray-400 mt-1">
            Create flashcards manually or generate them with AI
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setCreationMode("manual")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${creationMode === "manual"
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <Plus className="h-4 w-4" />
              Manual Creation
            </button>
            <button
              onClick={() => setCreationMode("ai")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${creationMode === "ai"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Generation
            </button>
          </div>

          {/* Manual Creation Form */}
          {creationMode === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic_select" className="text-white mb-2 block">
                      Select Topic
                    </Label>
                    <Select
                      value={manualForm.topic_id}
                      onValueChange={(value) =>
                        setManualForm({
                          ...manualForm,
                          topic_id: value,
                          custom_topic: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic..." />
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

                  <div>
                    <Label htmlFor="custom_topic" className="text-white mb-2 block">
                      Or Create New Topic
                    </Label>
                    <Input
                      id="custom_topic"
                      value={manualForm.custom_topic}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          custom_topic: e.target.value,
                          topic_id: "",
                        })
                      }
                      placeholder="Enter new topic name..."
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="question" className="text-white mb-2 block">
                      Question
                    </Label>
                    <Textarea
                      id="question"
                      value={manualForm.question}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, question: e.target.value })
                      }
                      placeholder="Enter your question..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="answer" className="text-white mb-2 block">
                      Answer
                    </Label>
                    <Textarea
                      id="answer"
                      value={manualForm.answer}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, answer: e.target.value })
                      }
                      placeholder="Enter the answer..."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createFlashcardMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {createFlashcardMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Flashcard"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* AI Generation Form */}
          {creationMode === "ai" && (
            <form onSubmit={handleAISubmit} className="space-y-4">
              <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai_topic_select" className="text-white mb-2 block">
                      Select Topic
                    </Label>
                    <Select
                      value={aiForm.topic_id}
                      onValueChange={(value) =>
                        setAIForm({
                          ...aiForm,
                          topic_id: value,
                          custom_topic: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic..." />
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

                  <div>
                    <Label htmlFor="ai_custom_topic" className="text-white mb-2 block">
                      Or Create New Topic
                    </Label>
                    <Input
                      id="ai_custom_topic"
                      value={aiForm.custom_topic}
                      onChange={(e) =>
                        setAIForm({
                          ...aiForm,
                          custom_topic: e.target.value,
                          topic_id: "",
                        })
                      }
                      placeholder="Enter new topic name..."
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="num_flashcards" className="text-white mb-2 block">
                      Number of Flashcards
                    </Label>
                    <Select
                      value={aiForm.num_flashcards.toString()}
                      onValueChange={(value) =>
                        setAIForm({ ...aiForm, num_flashcards: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 flashcards</SelectItem>
                        <SelectItem value="5">5 flashcards</SelectItem>
                        <SelectItem value="10">10 flashcards</SelectItem>
                        <SelectItem value="15">15 flashcards</SelectItem>
                        <SelectItem value="20">20 flashcards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty" className="text-white mb-2 block">
                      Difficulty Level
                    </Label>
                    <Select
                      value={aiForm.difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") =>
                        setAIForm({ ...aiForm, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content_source" className="text-white mb-2 block">
                      Content Source
                    </Label>
                    <Textarea
                      id="content_source"
                      value={aiForm.content_source}
                      onChange={(e) =>
                        setAIForm({ ...aiForm, content_source: e.target.value })
                      }
                      placeholder="Paste your content here (text, notes, article, etc.)..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional_instructions" className="text-white mb-2 block">
                      Additional Instructions (Optional)
                    </Label>
                    <Textarea
                      id="additional_instructions"
                      value={aiForm.additional_instructions}
                      onChange={(e) =>
                        setAIForm({ ...aiForm, additional_instructions: e.target.value })
                      }
                      placeholder="Any specific instructions for the AI..."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating || generateAIFlashcardsMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isGenerating || generateAIFlashcardsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Flashcards
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
