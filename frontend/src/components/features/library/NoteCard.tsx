import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, FileText, Calendar, Tag, Sparkles, Eye, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  topic: string;
  wordCount: number;
  lastEdited: string;
}

interface NoteCardProps {
  note: Note;
  viewMode: "grid" | "list";
  onView?: (note: Note) => void;
  onDelete?: (noteId: string) => Promise<void>;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, viewMode, onView, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Unknown") return "Unknown";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return "Unknown";
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDelete = async () => {
    if (!onDelete) return;

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

    setIsDeleting(true);
    
    try {
      // Show loading toast
      toast.loading("Deleting note...", { 
        id: `delete-note-${note.id}`,
        duration: 0
      });

      await onDelete(note.id);

      // Dismiss loading toast and show success
      toast.dismiss(`delete-note-${note.id}`);
      toast.success("Note deleted successfully!", {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#ffffff',
          border: '1px solid #059669',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#10B981',
        },
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(`delete-note-${note.id}`);
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
    } finally {
      setIsDeleting(false);
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group"
      >
        <Card 
          className="bg-gradient-to-r from-slate-800/90 via-slate-800/95 to-slate-800/90 border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl relative overflow-hidden cursor-pointer"
          onClick={() => onView?.(note)}
        >
          {/* Premium Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-4">
              <div className="flex items-center justify-between sm:justify-start">
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-0 flex-shrink-0 sm:hidden">
                  <div className="relative group/tooltip">
                                      <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-10 w-10 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(note);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  </div>

                  <div className="relative group/tooltip">
                                      <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-10 w-10 p-0 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                  >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-semibold text-white text-base sm:text-lg truncate mb-1 group-hover:text-green-300 transition-colors duration-200">{note.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3 group-hover:text-gray-300 transition-colors duration-200 break-words">{truncateText(note.content, 120)}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  {note.topic && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-green-300 font-medium bg-green-500/10 px-2 py-1 rounded-full truncate max-w-24 sm:max-w-32">{note.topic}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3 w-3 text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-blue-300 font-medium bg-blue-500/10 px-2 py-1 rounded-full">{note.wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-purple-300 font-medium bg-purple-500/10 px-2 py-1 rounded-full">{formatDate(note.lastEdited)}</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-1 flex-shrink-0">
                <div className="relative group/tooltip">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(note);
                    }}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                    View Note
                    <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>

                <div className="relative group/tooltip">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                    {isDeleting ? "Deleting..." : "Delete Note"}
                    <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group h-full"
    >
      <Card 
        className="bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-800/90 border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl h-full relative overflow-hidden cursor-pointer"
        onClick={() => onView?.(note)}
      >
        {/* Premium Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardContent className="p-4 sm:p-6 h-full flex flex-col relative">
          {/* Header with Icon and Actions */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
              </div>
            </div>
            <div className="flex space-x-0 flex-shrink-0">
              <div className="relative group/tooltip">
                                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(note);
                    }}
                  >
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                  View Note
                  <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>

              <div className="relative group/tooltip">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                  {isDeleting ? "Deleting..." : "Delete Note"}
                  <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-white text-sm sm:text-lg mb-2 sm:mb-3 line-clamp-2 leading-tight group-hover:text-green-300 transition-colors duration-200 break-words">{note.title}</h3>
          
          {/* Content Preview */}
          <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-3 flex-grow group-hover:text-gray-300 transition-colors duration-200 break-words">{truncateText(note.content, 120)}</p>
          
          {/* Stats and Actions */}
          <div className="space-y-3 sm:space-y-4 mt-auto">
            {/* Topic and Word Count */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {note.topic && (
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-green-300 font-medium bg-green-500/10 px-2 py-1 rounded-full truncate max-w-20 sm:max-w-24">{note.topic}</span>
                </div>
              )}
              <span className="text-white font-semibold text-xs sm:text-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-2 sm:px-3 py-1 rounded-full">{note.wordCount} words</span>
            </div>
            
            {/* Date and Actions */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-700/50">
              <div className="flex items-center space-x-1 min-w-0">
                <Calendar className="h-3 w-3 text-purple-400 flex-shrink-0" />
                <span className="text-xs text-purple-300 font-medium bg-purple-500/10 px-2 py-1 rounded-full">{formatDate(note.lastEdited)}</span>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 