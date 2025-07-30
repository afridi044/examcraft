import React from "react";
import { motion } from "framer-motion";
import { NoteCard } from "@/components/features/library/NoteCard";
import { EmptyState } from "./EmptyState";
import type { StudyNote } from "@/types";

interface NotesGridProps {
  notes: StudyNote[];
  onDelete?: (noteId: string) => Promise<void>;
}

export const NotesGrid: React.FC<NotesGridProps> = ({ notes, onDelete }) => {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title="No notes found"
        description="Create your first study note to start organizing your learning"
        actionLabel="Create Note"
        actionHref="/notes/create"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
      {notes.map((note, index) => (
        <motion.div
          key={note.note_id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.05,
            ease: "easeOut" 
          }}
          whileHover={{ 
            scale: 1.02, 
            y: -4,
            transition: { duration: 0.2 }
          }}
          className="group"
        >
          <NoteCard 
            note={{
              id: note.note_id,
              title: note.title,
              content: note.content,
              topic: note.topic || "General",
              wordCount: note.word_count || 0,
              lastEdited: note.updated_at || "Unknown",
            }} 
            viewMode="grid" 
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
}; 