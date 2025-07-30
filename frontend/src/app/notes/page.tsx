"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useBackendNotes, useDeleteBackendNote, useInvalidateBackendNotes } from "@/hooks/useBackendNotes";
import { NotesHeader } from "@/components/features/notes/NotesHeader";
import { NotesGrid } from "@/components/features/notes/NotesGrid";
import { NotesList } from "@/components/features/notes/NotesList";
import { CreateNoteButton } from "@/components/features/notes/CreateNoteButton";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import type { StudyNote } from "@/types";

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const notesQuery = useBackendNotes();
  const deleteNoteMutation = useDeleteBackendNote();
  const invalidateNotes = useInvalidateBackendNotes();

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync(noteId);
      
      // Invalidate and refetch the notes data to update the UI
      invalidateNotes();
      
      // Show success toast
      toast.success("Note deleted successfully!", {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#ffffff',
          border: '1px solid #059669',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#10B981',
        },
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // Show error toast
      toast.error("Failed to delete note. Please try again.", {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#ffffff',
          border: '1px solid #DC2626',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#EF4444',
        },
      });
    }
  };

  const filteredNotes = useMemo(() => {
    let notes = notesQuery.data || [];
    if (searchQuery) {
      notes = notes.filter((note: StudyNote) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedTopic !== "all") {
      notes = notes.filter((note: StudyNote) => note.topic === selectedTopic);
    }
    return notes;
  }, [notesQuery.data, searchQuery, selectedTopic]);

  const topics = useMemo(() => {
    const notes = notesQuery.data || [];
    const uniqueTopics = [...new Set(notes.map((note: StudyNote) => note.topic).filter(Boolean))] as string[];
    return uniqueTopics;
  }, [notesQuery.data]);

  if (notesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-slate-800 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notesQuery.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Notes</h2>
          <p className="text-gray-400">Something went wrong while loading your notes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <NotesHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
            topics={topics}
            totalNotes={notesQuery.data?.length || 0}
            filteredNotes={filteredNotes.length}
          />
        </motion.div>

        {/* Premium Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <AnimatePresence mode="wait">
            {filteredNotes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {searchQuery || selectedTopic !== "all" ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Notes Found</h3>
                    <p className="text-gray-400 mb-6">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTopic("all");
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Notes Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Start creating your first study note to organize your learning.
                    </p>
                    <button
                      onClick={() => window.location.href = "/notes/create"}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
                    >
                      Create Your First Note
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === "grid" ? (
                  <NotesGrid notes={filteredNotes} onDelete={handleDeleteNote} />
                ) : (
                  <NotesList notes={filteredNotes} onDelete={handleDeleteNote} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Premium Floating Action Button */}
        <CreateNoteButton />
      </div>
    </div>
  );
} 