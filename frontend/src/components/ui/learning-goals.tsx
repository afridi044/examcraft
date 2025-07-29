"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  X, 
  Plus, 
  CheckCircle, 
  Clock,
  Calendar,
  Award,
  BookOpen,
  Brain,
  Star,
  TrendingUp
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: 'study' | 'quiz' | 'flashcard' | 'accuracy';
  completed: boolean;
  icon: React.ReactNode;
}

interface LearningGoalsProps {
  isOpen: boolean;
  onClose: () => void;
}

const dummyGoals: Goal[] = [
  {
    id: '1',
    title: 'Master Chemistry Fundamentals',
    description: 'Complete all basic chemistry concepts and achieve 90% accuracy',
    target: 50,
    current: 35,
    unit: 'questions',
    deadline: '2024-02-15',
    category: 'study',
    completed: false,
    icon: <BookOpen className="w-4 h-4" />
  },
  {
    id: '2',
    title: 'Complete 20 Quizzes',
    description: 'Take and complete 20 quizzes across all subjects',
    target: 20,
    current: 12,
    unit: 'quizzes',
    deadline: '2024-02-28',
    category: 'quiz',
    completed: false,
    icon: <Target className="w-4 h-4" />
  },
  {
    id: '3',
    title: 'Review 100 Flashcards',
    description: 'Study and review 100 flashcards to improve retention',
    target: 100,
    current: 67,
    unit: 'flashcards',
    deadline: '2024-02-20',
    category: 'flashcard',
    completed: false,
    icon: <Brain className="w-4 h-4" />
  },
  {
    id: '4',
    title: 'Achieve 85% Accuracy',
    description: 'Maintain an overall accuracy rate of 85% or higher',
    target: 85,
    current: 78,
    unit: '%',
    deadline: '2024-03-01',
    category: 'accuracy',
    completed: false,
    icon: <Star className="w-4 h-4" />
  },
  {
    id: '5',
    title: 'Study for 30 Hours',
    description: 'Accumulate 30 hours of focused study time',
    target: 30,
    current: 25,
    unit: 'hours',
    deadline: '2024-02-25',
    category: 'study',
    completed: false,
    icon: <Clock className="w-4 h-4" />
  }
];

export function LearningGoals({ isOpen, onClose }: LearningGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(dummyGoals);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    unit: '',
    deadline: '',
    category: 'study' as const
  });

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getGoalColor = (category: string) => {
    switch (category) {
      case 'study':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'quiz':
        return 'border-green-500/30 bg-green-500/10';
      case 'flashcard':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'accuracy':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getGoalIconColor = (category: string) => {
    switch (category) {
      case 'study':
        return 'text-blue-400';
      case 'quiz':
        return 'text-green-400';
      case 'flashcard':
        return 'text-purple-400';
      case 'accuracy':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const addGoal = () => {
    if (newGoal.title && newGoal.target > 0) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        target: newGoal.target,
        current: 0,
        unit: newGoal.unit,
        deadline: newGoal.deadline,
        category: newGoal.category,
        completed: false,
        icon: <Target className="w-4 h-4" />
      };
      setGoals(prev => [goal, ...prev]);
      setNewGoal({
        title: '',
        description: '',
        target: 0,
        unit: '',
        deadline: '',
        category: 'study'
      });
      setShowAddForm(false);
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;

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
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Learning Goals</h3>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {completedGoals}/{totalGoals}
                </span>
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

            {/* Content */}
            <div className="max-h-96 overflow-y-auto p-4">
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No goals set yet</p>
                  <p className="text-xs text-gray-500 mt-1">Set your first learning goal to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${getGoalColor(goal.category)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 mt-1 ${getGoalIconColor(goal.category)}`}>
                          {goal.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white">
                              {goal.title}
                            </h4>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-300 mb-2">
                            {goal.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">
                                {goal.current}/{goal.target} {goal.unit}
                              </span>
                              <span className="text-white font-medium">
                                {Math.round(getGoalProgress(goal))}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700/30 rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${getGoalProgress(goal)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Deadline: {goal.deadline}</span>
                              {goal.completed && (
                                <span className="text-green-400 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Goal Form */}
            {showAddForm && (
              <div className="p-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3">Add New Goal</h4>
                <div className="space-y-3">
                  <Input
                    placeholder="Goal title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
                  />
                  <Input
                    placeholder="Description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Target"
                      value={newGoal.target || ''}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                      className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
                    />
                    <Input
                      placeholder="Unit (e.g., questions, hours)"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={addGoal}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add Goal
                    </Button>
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAddForm ? 'Cancel' : 'Add New Goal'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 