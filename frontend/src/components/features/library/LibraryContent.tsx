import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { NoteCard } from "./NoteCard";
import { BookCard } from "./BookCard";
import { StudyMaterialCard } from "./StudyMaterialCard";
import { useBackendLibraryNotes } from "@/hooks/useBackendLibrary";
import { useBooks } from "@/hooks/useBooks";
import type { StudyNote } from "@/types";

interface LibraryContentProps {
  activeTab: "notes" | "materials" | "books";
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const LibraryContent: React.FC<LibraryContentProps> = ({
  activeTab,
  searchQuery,
  viewMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  // Real data from hooks
  const notesQuery = useBackendLibraryNotes();
  const booksQuery = useBooks();

  const notes = notesQuery.data?.map((note: StudyNote) => ({
    id: note?.note_id || "",
    title: note?.title || "Untitled Note",
    content: note?.content || "",
    topic: (note as any)?.topics?.name || note?.topic || "General",
    wordCount: note?.word_count || 0,
    lastEdited: note?.updated_at || note?.last_edited || "Unknown",
  })) || [];

  const books = booksQuery.data || [];

  // Mock study materials data organized by categories
  const studyMaterials = [
    // PDFs & Documents
    {
      id: "1",
      title: "Study Schedule Template",
      description: "A comprehensive weekly study schedule template with time blocks for different subjects, breaks, and review sessions. Perfect for organizing your study routine.",
      type: "pdf" as const,
      category: "documents" as const,
      subject: "Study Skills",
      fileSize: "2.1 MB",
      downloadCount: 1247,
      dateAdded: "2024-01-15",
      url: "https://example.com/downloads/study-schedule-template.pdf",
      coverColor: "from-blue-500 to-blue-600",
      isPremium: true,
      isDownloadable: true
    },
    {
      id: "2",
      title: "Note-Taking Framework",
      description: "Structured note-taking templates including Cornell method, mind mapping, and outline formats. Enhance your learning with proven note-taking strategies.",
      type: "pdf" as const,
      category: "documents" as const,
      subject: "Study Skills",
      fileSize: "3.5 MB",
      downloadCount: 892,
      dateAdded: "2024-01-10",
      url: "https://example.com/downloads/note-taking-framework.pdf",
      coverColor: "from-green-500 to-green-600",
      isDownloadable: true
    },
    {
      id: "3",
      title: "Math Formula Reference Sheet",
      description: "Complete reference sheet with all essential math formulas from algebra to calculus. Includes examples and quick reference guides for exams.",
      type: "pdf" as const,
      category: "documents" as const,
      subject: "Mathematics",
      fileSize: "1.8 MB",
      downloadCount: 2156,
      dateAdded: "2024-01-08",
      url: "https://example.com/downloads/math-formulas-reference.pdf",
      coverColor: "from-purple-500 to-purple-600",
      isPremium: true,
      isDownloadable: true
    },
    {
      id: "4",
      title: "Essay Writing Toolkit",
      description: "Complete toolkit for academic writing including essay templates, citation guides, and writing checklists. Master the art of academic writing.",
      type: "pdf" as const,
      category: "documents" as const,
      subject: "Writing",
      fileSize: "4.2 MB",
      downloadCount: 1567,
      dateAdded: "2024-01-12",
      url: "https://example.com/downloads/essay-writing-toolkit.pdf",
      coverColor: "from-orange-500 to-orange-600",
      isDownloadable: true
    },
    {
      id: "5",
      title: "Flashcard Creation Guide",
      description: "Step-by-step guide for creating effective flashcards with templates and best practices. Learn how to make flashcards that actually work.",
      type: "pdf" as const,
      category: "documents" as const,
      subject: "Study Skills",
      fileSize: "2.7 MB",
      downloadCount: 743,
      dateAdded: "2024-01-05",
      url: "https://example.com/downloads/flashcard-creation-guide.pdf",
      coverColor: "from-pink-500 to-pink-600",
      isDownloadable: true
    },
    // Spreadsheets & Sheets
    {
      id: "6",
      title: "Study Progress Tracker",
      description: "Excel spreadsheet template for tracking your study progress, goals, and achievements. Monitor your learning journey effectively.",
      type: "sheet" as const,
      category: "sheets" as const,
      subject: "Study Skills",
      fileSize: "1.5 MB",
      downloadCount: 634,
      dateAdded: "2024-01-03",
      url: "https://example.com/downloads/study-progress-tracker.xlsx",
      coverColor: "from-indigo-500 to-indigo-600",
      isDownloadable: true
    },
    {
      id: "7",
      title: "Grade Calculator",
      description: "Smart spreadsheet to calculate your grades, GPA, and track academic performance across all subjects.",
      type: "sheet" as const,
      category: "sheets" as const,
      subject: "Study Skills",
      fileSize: "0.8 MB",
      downloadCount: 2156,
      dateAdded: "2024-01-20",
      url: "https://example.com/downloads/grade-calculator.xlsx",
      coverColor: "from-emerald-500 to-emerald-600",
      isDownloadable: true
    },
    {
      id: "8",
      title: "Budget Planner for Students",
      description: "Comprehensive budget tracking spreadsheet designed specifically for student expenses and income management.",
      type: "sheet" as const,
      category: "sheets" as const,
      subject: "Life Skills",
      fileSize: "1.2 MB",
      downloadCount: 892,
      dateAdded: "2024-01-18",
      url: "https://example.com/downloads/student-budget-planner.xlsx",
      coverColor: "from-teal-500 to-teal-600",
      isDownloadable: true
    },
    // Videos & Tutorials
    {
      id: "9",
      title: "Effective Study Techniques",
      description: "Comprehensive video tutorial covering proven study methods, time management, and memory techniques for academic success.",
      type: "video" as const,
      category: "videos" as const,
      subject: "Study Skills",
      duration: "45:30",
      viewCount: 15420,
      dateAdded: "2024-01-15",
      url: "https://www.youtube.com/watch?v=effective-study-techniques",
      coverColor: "from-red-500 to-red-600",
      isDownloadable: false
    },
    {
      id: "10",
      title: "Math Problem Solving Strategies",
      description: "Step-by-step video guide showing how to approach and solve complex mathematical problems with confidence.",
      type: "video" as const,
      category: "videos" as const,
      subject: "Mathematics",
      duration: "32:15",
      viewCount: 8920,
      dateAdded: "2024-01-12",
      url: "https://www.youtube.com/watch?v=math-problem-solving",
      coverColor: "from-purple-500 to-purple-600",
      isDownloadable: false
    },
    {
      id: "11",
      title: "Essay Writing Masterclass",
      description: "Complete video course on academic writing, from brainstorming to final revision. Perfect for college students.",
      type: "video" as const,
      category: "videos" as const,
      subject: "Writing",
      duration: "1:15:45",
      viewCount: 23450,
      dateAdded: "2024-01-10",
      url: "https://www.youtube.com/watch?v=essay-writing-masterclass",
      coverColor: "from-orange-500 to-orange-600",
      isDownloadable: false
    },
    // Websites & Apps
    {
      id: "12",
      title: "Khan Academy",
      description: "Free online learning platform with courses in math, science, humanities, and more. Perfect for supplementing your studies.",
      type: "website" as const,
      category: "websites" as const,
      subject: "Multiple Subjects",
      rating: "4.8/5",
      userCount: "10M+",
      dateAdded: "2024-01-05",
      url: "https://www.khanacademy.org",
      coverColor: "from-blue-500 to-blue-600",
      isDownloadable: false
    },
    {
      id: "13",
      title: "Coursera",
      description: "Access courses from top universities worldwide. Earn certificates and even degrees online in various subjects.",
      type: "website" as const,
      category: "websites" as const,
      subject: "Multiple Subjects",
      rating: "4.7/5",
      userCount: "5M+",
      dateAdded: "2024-01-08",
      url: "https://www.coursera.org",
      coverColor: "from-green-500 to-green-600",
      isDownloadable: false
    },
    {
      id: "14",
      title: "Anki",
      description: "Powerful flashcard app using spaced repetition to help you memorize information effectively. Available on all platforms.",
      type: "app" as const,
      category: "websites" as const,
      subject: "Study Skills",
      rating: "4.9/5",
      userCount: "2M+",
      dateAdded: "2024-01-12",
      url: "https://apps.ankiweb.net",
      coverColor: "from-indigo-500 to-indigo-600",
      isDownloadable: false
    },
    {
      id: "15",
      title: "Grammarly",
      description: "AI-powered writing assistant that helps improve grammar, style, and clarity in your academic writing.",
      type: "app" as const,
      category: "websites" as const,
      subject: "Writing",
      rating: "4.6/5",
      userCount: "30M+",
      dateAdded: "2024-01-15",
      url: "https://www.grammarly.com",
      coverColor: "from-emerald-500 to-emerald-600",
      isDownloadable: false
    }
  ];

  const getContent = () => {
    switch (activeTab) {
      case "books":
        return {
          items: books,
          emptyState: {
            icon: "📚",
            title: "No books available",
            description: "Your digital library is empty. Add some books to get started with your studies.",
            actionLabel: "Browse Books",
            actionHref: "/library",
          },
        };
      case "notes":
        return {
          items: notes,
          emptyState: {
            icon: "📖",
            title: "No study notes yet",
            description: "Capture your learning insights and key concepts",
            actionLabel: "Add Notes",
            actionHref: "/library/notes/create",
          },
        };

      case "materials":
        return {
          items: studyMaterials,
          emptyState: {
            icon: "📋",
            title: "No study materials yet",
            description: "Download templates, reference sheets, and study tools to enhance your learning experience.",
            actionLabel: "Browse Library",
            actionHref: "/library",
          },
        };
    }
  };

  const content = getContent();
  
  // Filter items based on search and category
  const filteredItems = content.items.filter((item: any) => {
    const matchesSearch = item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    
    // For materials, also filter by category
    if (activeTab === "materials") {
      const matchesCategory = selectedCategory === "all" || item?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }
    
    return matchesSearch;
  });

  if (filteredItems.length === 0) {
    return (
      <EmptyState
        icon={content.emptyState.icon}
        title={content.emptyState.title}
        description={content.emptyState.description}
        actionLabel={content.emptyState.actionLabel}
        actionHref={content.emptyState.actionHref}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button for Notes Tab */}
      {activeTab === "notes" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-start"
        >
          <button
            onClick={() => window.location.href = "/notes/create"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </motion.div>
      )}

      {/* Category Filter for Materials Tab */}
      {activeTab === "materials" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { id: "all", label: "All", icon: "📚" },
            { id: "documents", label: "PDFs & Documents", icon: "📄" },
            { id: "sheets", label: "Spreadsheets", icon: "📊" },
            { id: "videos", label: "Videos", icon: "🎥" },
            { id: "websites", label: "Websites & Apps", icon: "🌐" }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-white backdrop-blur-sm border border-blue-400/30 shadow-lg"
                  : "text-gray-300 hover:text-gray-200 hover:bg-gray-700/30 hover:backdrop-blur-sm border border-gray-700/30"
              }`}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Content Grid */}
    <div className={`${
      viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" // 3 columns for all tabs
        : "space-y-3"
    }`}>
      {filteredItems.map((item: any) => {
        switch (activeTab) {
          case "books":
            return (
              <BookCard
                key={item.id}
                book={item}
                viewMode={viewMode}
              />
            );
          case "notes":
            return (
              <NoteCard
                key={item.id}
                note={item}
                viewMode={viewMode}
              />
            );

          case "materials":
            return (
              <StudyMaterialCard
                key={item.id}
                material={item}
                viewMode={viewMode}
              />
            );
        }
      })}
      </div>
    </div>
  );
}; 