"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Clock, 
  Coffee,
  BookOpen,
  Target,
  Timer
} from "lucide-react";

interface StudySession {
  id: string;
  duration: number;
  type: 'study' | 'break';
  completed: boolean;
  timestamp: string;
}

interface StudyTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMER_MODES = {
  study: { duration: 25 * 60, label: 'Study', color: 'bg-blue-500', icon: BookOpen },
  shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500', icon: Coffee },
  longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-purple-500', icon: Coffee }
};

export function StudyTimer({ isOpen, onClose }: StudyTimerProps) {
  const [currentMode, setCurrentMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.study.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dummy session data
  const dummySessions: StudySession[] = [
    { id: '1', duration: 25 * 60, type: 'study', completed: true, timestamp: '2 hours ago' },
    { id: '2', duration: 5 * 60, type: 'break', completed: true, timestamp: '1 hour ago' },
    { id: '3', duration: 25 * 60, type: 'study', completed: true, timestamp: '30 minutes ago' },
    { id: '4', duration: 15 * 60, type: 'break', completed: true, timestamp: '15 minutes ago' },
  ];

  useEffect(() => {
    setSessions(dummySessions);
    setCompletedSessions(dummySessions.filter(s => s.completed).length);
    setTotalStudyTime(dummySessions.filter(s => s.type === 'study' && s.completed).reduce((acc, s) => acc + s.duration, 0));
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return TIMER_MODES[currentMode].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentMode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    const newSession: StudySession = {
      id: Date.now().toString(),
      duration: TIMER_MODES[currentMode].duration,
      type: currentMode === 'study' ? 'study' : 'break',
      completed: true,
      timestamp: 'Just now'
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCompletedSessions(prev => prev + 1);
    
    if (currentMode === 'study') {
      setTotalStudyTime(prev => prev + TIMER_MODES[currentMode].duration);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_MODES[currentMode].duration);
  };

  const switchMode = (mode: 'study' | 'shortBreak' | 'longBreak') => {
    setCurrentMode(mode);
    setTimeLeft(TIMER_MODES[mode].duration);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = TIMER_MODES[currentMode].duration;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Study Timer</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Timer Display */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                      className={`text-${TIMER_MODES[currentMode].color.split('-')[1]}-500 transition-all duration-1000`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {TIMER_MODES[currentMode].label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  {!isRunning ? (
                    <Button
                      onClick={startTimer}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTimer}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {Object.entries(TIMER_MODES).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => switchMode(key as any)}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      currentMode === key
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-slate-600 bg-slate-800/50 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <mode.icon className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{mode.label}</div>
                  </button>
                ))}
              </div>


            </div>




          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 