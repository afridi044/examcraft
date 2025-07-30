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

  const getActivityStatus = (dateString: string | null) => {
    if (!dateString) return { text: 'No activity yet', color: 'text-gray-500' };
    
    // Parse date without timezone manipulation
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return { 
        text: diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`, 
        color: 'text-emerald-400' 
      };
    } else if (diffInMinutes < 60) {
      return { 
        text: `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`, 
        color: 'text-emerald-400' 
      };
    } else if (diffInHours < 24) {
      return { 
        text: `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`, 
        color: 'text-emerald-400' 
      };
    } else if (diffInHours < 48) {
      return { text: 'Yesterday', color: 'text-emerald-400' };
    } else if (diffInDays <= 7) {
      return { text: `${diffInDays} days ago`, color: 'text-amber-400' };
    } else {
      return { text: `${diffInDays} days ago`, color: 'text-red-400' };
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
      className="space-y-4"
    >
      {/* Compact Note Content Card */}
      <Card className="bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 transition-all duration-300">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-600/30">
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-200 hover:text-white hover:bg-slate-700/50 transition-all duration-200 rounded-lg px-3 py-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Notes</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 rounded-lg disabled:opacity-50"
              onClick={handleDelete}
              disabled={isDeleting}
              title={isDeleting ? "Deleting..." : "Delete Note"}
            >
              <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
            </Button>
          </div>

                     {/* Compact Note Header */}
           <div className="flex items-start gap-3 mb-6">
             <div className="relative flex-shrink-0">
               <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                 <BookOpen className="h-6 w-6 text-white" />
               </div>
               <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                 <Sparkles className="h-2 w-2 text-white" />
               </div>
             </div>
             <div className="flex-1 min-w-0">
               <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">{note.title}</h1>
               <p className="text-gray-300 text-sm">Study Note</p>
             </div>
           </div>

           {/* Compact Metadata */}
           <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-6">
             {note.topics?.name && (
               <div className="flex items-center space-x-1">
                 <Tag className="h-3 w-3 text-green-400 flex-shrink-0" />
                 <span className="text-green-100 font-medium bg-green-600/30 px-2 py-1 rounded-md border border-green-500/50">
                   {note.topics.name}
                 </span>
               </div>
             )}
             <div className="flex items-center space-x-1">
               <FileText className="h-3 w-3 text-blue-400 flex-shrink-0" />
               <span className="text-blue-100 font-medium bg-blue-600/30 px-2 py-1 rounded-md border border-blue-500/50">
                 {note.word_count} words
               </span>
             </div>
             <div className="flex items-center space-x-1">
               <Calendar className="h-3 w-3 text-purple-400 flex-shrink-0" />
               <span className="text-purple-100 font-medium bg-purple-600/30 px-2 py-1 rounded-md border border-purple-500/50">
                 Updated {getActivityStatus(note.updated_at).text}
               </span>
             </div>
                         {note.tags && note.tags.length > 0 && (
               <div className="flex items-center space-x-1 w-full sm:w-auto">
                 <span className="text-xs text-gray-300 font-medium">Tags:</span>
                 <div className="flex flex-wrap gap-1">
                   {note.tags.map((tag, index) => (
                     <span
                       key={index}
                       className="text-xs text-amber-100 font-medium bg-amber-600/30 px-1.5 py-0.5 rounded-md border border-amber-500/50"
                     >
                       {tag}
                     </span>
                   ))}
                 </div>
               </div>
             )}
          </div>

                     {/* Compact Note Content */}
           <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 mb-6">
             <div className="prose prose-invert max-w-none">
               <div className="whitespace-pre-wrap text-gray-100 leading-relaxed text-sm sm:text-base">
                 {note.content}
               </div>
             </div>
           </div>

                     {/* Compact Additional Info */}
           <div className="max-w-md bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
             <h4 className="font-bold text-white mb-3 text-sm">Note Details</h4>
             <div className="space-y-2 text-xs sm:text-sm">
               <div className="flex justify-between items-center py-1 border-b border-slate-600/30">
                 <span className="text-gray-200">Type:</span>
                 <span className="text-blue-100 font-medium">{note.note_type}</span>
               </div>
               <div className="flex justify-between items-center py-1 border-b border-slate-600/30">
                 <span className="text-gray-200">Visibility:</span>
                 <span className="text-gray-100 font-medium">
                   {note.is_public ? "Public" : "Private"}
                 </span>
               </div>
               <div className="flex justify-between items-center py-1">
                 <span className="text-gray-200">Created:</span>
                 <span className="text-gray-100 font-medium">
                   {getActivityStatus(note.created_at).text}
                 </span>
               </div>
             </div>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 