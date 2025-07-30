import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Calendar, Tag, FileText, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface Note {
  note_id: string;
  title: string;
  content: string;
  topic_id?: string;
  topics?: { name: string };
  word_count: number;
  note_type: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface NoteDetailViewProps {
  note: Note;
  onBack: () => void;
  onDelete: (noteId: string) => void;
  isDeleting?: boolean;
}

export const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  note,
  onBack,
  onDelete,
  isDeleting = false,
}) => {

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Unknown";
    }
  };



  const handleDelete = async () => {
    // Show custom confirmation toast
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-slate-800 border border-slate-600 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 backdrop-blur-sm`}
          >
            <div className="flex-1 w-0 p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Delete Note
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Are you sure you want to delete <span className="font-semibold text-white">"{note.title}"</span>? 
                    This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast.dismiss(t.id);
                        resolve(false);
                      }}
                      className="flex-1 bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.dismiss(t.id);
                        resolve(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 transition-all duration-200"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ),
        {
          duration: 0, // Don't auto-dismiss
          position: 'top-center',
        }
      );
    });

    if (!confirmed) return;

    // Show loading toast
    toast.loading("Deleting note...", { 
      id: `delete-note-${note.note_id}`,
      duration: 0
    });

    try {
      onDelete(note.note_id);
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(`delete-note-${note.note_id}`);
      toast.error("Failed to delete note. Please try again.", {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#ffffff',
          border: '1px solid #DC2626',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#EF4444',
        },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Premium Note Content Card */}
      <Card className="bg-slate-900/95 border-slate-600/50 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 via-slate-700/20 to-slate-800/20 opacity-100 transition-opacity duration-500"></div>
        
        <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8 relative">
          {/* Header with Back Button */}
          <div className="flex items-center pb-6 border-b border-slate-600/30">
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center space-x-3 text-gray-200 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-xl px-4 py-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Notes</span>
            </Button>
          </div>
          {/* Enhanced Note Header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">{note.title}</h1>
                  <p className="text-gray-300 text-sm sm:text-base">Study Note</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 rounded-xl disabled:opacity-50"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title={isDeleting ? "Deleting..." : "Delete Note"}
                  >
                    <Trash2 className={`h-5 w-5 ${isDeleting ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
            {note.topics?.name && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-green-200 font-semibold bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
                  {note.topics.name}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="text-blue-200 font-semibold bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30">
                {note.word_count} words
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <span className="text-purple-200 font-semibold bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-500/30">
                Updated {formatDate(note.updated_at)}
              </span>
            </div>
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm text-gray-300 font-medium">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs sm:text-sm text-amber-200 font-medium bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30"
                    >
                      {tag}
                  </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Note Content */}
          <div className="bg-slate-800/60 rounded-2xl p-6 sm:p-8 border border-slate-600/40 shadow-inner">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-100 leading-relaxed text-base sm:text-lg">
                {note.content}
              </div>
            </div>
          </div>

          {/* Enhanced Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-600/30 shadow-lg">
              <h4 className="font-bold text-white mb-4 text-lg">Note Details</h4>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between items-center py-2 border-b border-slate-600/30">
                  <span className="text-gray-200">Type:</span>
                  <span className="text-blue-200 font-semibold">{note.note_type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-600/30">
                  <span className="text-gray-200">Visibility:</span>
                  <span className={`font-semibold ${note.is_public ? "text-green-200" : "text-orange-200"}`}>
                    {note.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-200">Created:</span>
                  <span className="text-purple-200 font-semibold">{formatDate(note.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 