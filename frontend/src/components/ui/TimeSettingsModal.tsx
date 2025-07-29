"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Play, Timer } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

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

  const handleUseDefault = () => {
    setTimeLimitMinutes(numQuestions);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Quiz Settings</h2>
                  <p className="text-sm text-gray-400">{quizTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Time Settings */}
            <div className="space-y-6">
              {/* Timed/Untimed Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="space-y-1">
                    <Label className="text-gray-300 font-medium">Timed Quiz</Label>
                    <p className="text-sm text-gray-400">
                      Enable time limit. Quiz will auto-submit when time expires.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsTimed(!isTimed)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        isTimed ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isTimed ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${isTimed ? 'text-purple-400' : 'text-gray-400'}`}>
                      {isTimed ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Time Limit Input */}
                {isTimed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      {/* Default Time */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Default Time Limit</Label>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">
                              {numQuestions} min ({numQuestions} questions × 1 min each)
                            </span>
                            <button
                              onClick={handleUseDefault}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                            >
                              Use Default
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Custom Time Limit */}
                      <div className="space-y-2">
                        <Label htmlFor="time_limit_minutes" className="text-gray-300">
                          Custom Time Limit (minutes)
                        </Label>
                        <Input
                          id="time_limit_minutes"
                          type="number"
                          min="1"
                          max="300"
                          value={timeLimitMinutes}
                          onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 1)}
                          placeholder="Enter time limit in minutes"
                          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400">
                          Recommended: 1-2 minutes per question
                        </p>
                      </div>

                      {/* Time Preview */}
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center space-x-2">
                          <Timer className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-300 font-medium">
                            Quiz will auto-submit after {timeLimitMinutes} minutes
                          </span>
                        </div>
                        <p className="text-xs text-blue-400 mt-1">
                          ~{Math.round(timeLimitMinutes / numQuestions * 10) / 10} minutes per question
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStart}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 