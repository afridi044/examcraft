import React from "react";
import { motion } from "framer-motion";
import { NoteCard } from "../library/NoteCard";
import { EmptyState } from "./EmptyState";
import type { StudyNote } from "@/types";

interface NotesListProps {
  notes: StudyNote[];
  onDelete?: (noteId: string) => Promise<void>;
}

export const NotesList: React.FC<NotesListProps> = ({ notes, onDelete }) => {
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
    <div className="space-y-3 sm:space-y-4">
      {notes.map((note, index) => (
        <motion.div
          key={note.note_id}
          initial={{ opacity: 0, x: -20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.05,
            ease: "easeOut" 
          }}
          whileHover={{ 
            scale: 1.01, 
            x: 4,
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
            viewMode="list" 
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
}; 