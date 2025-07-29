import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Share2, MoreVertical, FileText, Calendar, Tag, Sparkles, Eye, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
  viewMode: "grid" | "list";
}

export const BookCard: React.FC<BookCardProps> = ({ book, viewMode }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    
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

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-3 w-3" />;
      case 'epub':
        return <BookOpen className="h-3 w-3" />;
      case 'textbook':
        return <BookOpen className="h-3 w-3" />;
      case 'study-guide':
        return <Bookmark className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf':
        return "text-red-400 bg-red-500/10";
      case 'epub':
        return "text-blue-400 bg-blue-500/10";
      case 'textbook':
        return "text-green-400 bg-green-500/10";
      case 'study-guide':
        return "text-purple-400 bg-purple-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const handleViewBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(book.url, '_blank');
  };

  const handleShareBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.description,
        url: book.url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${book.title}\n${book.url}`);
      // You could add a toast notification here
    }
  };



    if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group cursor-pointer"
        onClick={() => window.open(book.url, '_blank')}
      >
        <Card className="bg-gradient-to-r from-slate-800/90 via-slate-800/95 to-slate-800/90 border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl relative overflow-hidden">
          {/* Premium Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-4">
              <div className="flex items-center justify-between sm:justify-start">
                <div className="relative flex-shrink-0">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br ${book.coverColor} rounded-xl flex items-center justify-center shadow-lg`}>
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                  </div>
                </div>
                <div className="flex items-center space-x-0 flex-shrink-0 sm:hidden">
                  <div className="relative group/tooltip">
                    <Button size="sm" variant="ghost" className="h-10 w-10 p-0 hover:bg-blue-500/20 hover:text-blue-400" onClick={handleViewBook}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative group/tooltip">
                    <Button size="sm" variant="ghost" className="h-10 w-10 p-0 hover:bg-purple-500/20 hover:text-purple-400" onClick={handleShareBook}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-semibold text-white text-base sm:text-lg truncate mb-1 group-hover:text-blue-300 transition-colors duration-200">{book.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3 group-hover:text-gray-300 transition-colors duration-200 break-words">{truncateText(book.description, 120)}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3 text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-blue-300 font-medium bg-blue-500/10 px-2 py-1 rounded-full truncate max-w-24 sm:max-w-32">{book.subject}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3 w-3 text-green-400 flex-shrink-0" />
                    <span className="text-xs text-green-300 font-medium bg-green-500/10 px-2 py-1 rounded-full">{book.pageCount} pages</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-3 w-3 text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-purple-300 font-medium bg-purple-500/10 px-2 py-1 rounded-full">{book.chapterCount} chapters</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-amber-300 font-medium bg-amber-500/10 px-2 py-1 rounded-full">{formatDate(book.dateAdded)}</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-1 flex-shrink-0">
                <div className="relative group/tooltip">
                  <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-500/20 hover:text-blue-400" onClick={handleViewBook}>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                    View Book
                    <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                  </div>
                </div>

                <div className="relative group/tooltip">
                  <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-purple-500/20 hover:text-purple-400" onClick={handleShareBook}>
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                    Share Book
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
      className="group h-full cursor-pointer"
      onClick={() => window.open(book.url, '_blank')}
    >
      <Card className="bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-800/90 border-slate-700/50 hover:border-slate-600/60 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl h-full relative overflow-hidden">
        {/* Premium Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardContent className="p-4 sm:p-6 h-full flex flex-col relative">
          {/* Header with Icon and Actions */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="relative flex-shrink-0">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br ${book.coverColor} rounded-xl flex items-center justify-center shadow-lg`}>
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
              </div>
            </div>
            <div className="flex space-x-0 flex-shrink-0">
              <div className="relative group/tooltip">
                <Button size="sm" variant="ghost" className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-blue-500/20 hover:text-blue-400" onClick={handleViewBook}>
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                  View Book
                  <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
              
              <div className="relative group/tooltip">
                <Button size="sm" variant="ghost" className="h-9 w-9 sm:h-10 sm:w-10 p-0 hover:bg-purple-500/20 hover:text-purple-400" onClick={handleShareBook}>
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-600 shadow-lg">
                  Share Book
                  <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-white text-sm sm:text-lg mb-2 sm:mb-3 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors duration-200 break-words">{book.title}</h3>
          
          {/* Content Preview */}
          <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 line-clamp-3 flex-grow group-hover:text-gray-300 transition-colors duration-200 break-words">{truncateText(book.description, 120)}</p>
          
          {/* Stats and Actions */}
          <div className="space-y-3 sm:space-y-4 mt-auto">
            {/* Subject and Format */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-1">
                <Tag className="h-3 w-3 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-blue-300 font-medium bg-blue-500/10 px-2 py-1 rounded-full truncate max-w-20 sm:max-w-24">{book.subject}</span>
              </div>
              <div className="flex items-center space-x-1">
                {getFormatIcon(book.format)}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getFormatColor(book.format)}`}>
                  {book.format.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            {/* Page Count and Chapters */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{book.pageCount} pages</span>
              <span className="text-white font-medium">{book.chapterCount} chapters</span>
            </div>
            
            {/* Date and Actions */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-700/50">
              <div className="flex items-center space-x-1 min-w-0">
                <Calendar className="h-3 w-3 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-300 font-medium bg-amber-500/10 px-2 py-1 rounded-full">{formatDate(book.dateAdded)}</span>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 