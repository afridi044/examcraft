"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Timer } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

interface TimeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (isTimed: boolean, timeLimitMinutes: number) => void;
  numQuestions: number;
  quizTitle: string;
}

export function TimeSettingsModal({
  isOpen,
  onClose,
  onStart,
  numQuestions,
  quizTitle,
}: TimeSettingsModalProps) {
  const [isTimed, setIsTimed] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(numQuestions);

  const handleStart = () => {
    onStart(isTimed, timeLimitMinutes);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
                     className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                         className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
                         {/* Header */}
             <div className="text-center mb-4 sm:mb-6">
               <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                 <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
               </div>
               <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Ready to start?</h2>
               <p className="text-slate-400 text-sm">{quizTitle}</p>
               <div className="text-slate-500 text-xs">{numQuestions} questions</div>
             </div>

                                      {/* Main Content */}
             <div className="space-y-3 sm:space-y-4">
               {/* Time Mode Selection */}
               <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                 <button
                   onClick={() => setIsTimed(false)}
                   className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 group ${
                     !isTimed 
                       ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                       : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                   }`}
                 >
                                        <div className="text-center">
                       <div className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-1.5 rounded-md flex items-center justify-center transition-colors ${
                         !isTimed ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                       }`}>
                         <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                       </div>
                       <div className={`font-medium text-xs ${!isTimed ? 'text-white' : 'text-slate-300'}`}>
                         Practice Mode
                       </div>
                     </div>
                 </button>

                                 <button
                   onClick={() => setIsTimed(true)}
                   className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 group ${
                     isTimed 
                       ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                       : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                   }`}
                 >
                                        <div className="text-center">
                       <div className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-1.5 rounded-md flex items-center justify-center transition-colors ${
                         isTimed ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                       }`}>
                         <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                       </div>
                       <div className={`font-medium text-xs ${isTimed ? 'text-white' : 'text-slate-300'}`}>
                         Timed Mode
                       </div>
                     </div>
                 </button>
              </div>

                             {/* Time Limit Input */}
                               {isTimed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="bg-slate-800/40 rounded-lg p-3 sm:p-4 border border-slate-700/50"
                  >
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                       <label className="text-white font-medium text-sm">Time Limit (minutes)</label>
                       <button
                         onClick={() => setTimeLimitMinutes(numQuestions)}
                         className="px-1.5 sm:px-2 py-0 sm:py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
                       >
                         Default ({numQuestions}m)
                       </button>
                     </div>
                   
                                                            <Input
                       type="number"
                       min="1"
                       max="300"
                       value={timeLimitMinutes}
                       onChange={(e) => setTimeLimitMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                       placeholder={`Default: ${numQuestions} minutes`}
                       className="bg-slate-700/50 border-slate-600 text-white text-center font-mono text-sm sm:text-base h-9 sm:h-10 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                     />
                 </motion.div>
               )}
            </div>

                         {/* Action Buttons */}
             <div className="flex space-x-3 pt-4 sm:pt-6">
               <Button
                 onClick={onClose}
                 variant="outline"
                 className="flex-1 h-9 sm:h-10 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white"
               >
                 Cancel
               </Button>
               <Button
                 onClick={handleStart}
                 className="flex-1 h-9 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-purple-500/25"
               >
                 <Play className="h-4 w-4 mr-2" />
                 Start Quiz
               </Button>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 