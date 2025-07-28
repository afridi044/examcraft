'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';

interface QuizPerformanceData {
  date: string;
  quiz_id: string;
  title: string;
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
}

interface QuizPerformanceChartProps {
  data: QuizPerformanceData[];
}

export function QuizPerformanceChart({ data }: QuizPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-100 mb-2">No Quiz Data</p>
          <p className="text-gray-400">Start taking quizzes to see your performance trends</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    score: item.score_percentage,
    title: item.title,
    totalQuestions: item.total_questions,
    correctAnswers: item.correct_answers,
  }));

  const averageScore = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length)
    : 0;
  const totalQuizzes = chartData.length;
  const bestScore = Math.max(...chartData.map(item => item.score));
  const worstScore = Math.min(...chartData.map(item => item.score));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-orange-300 mb-1">Average Score</p>
          <p className="text-lg font-bold text-orange-400">{averageScore}%</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-blue-300 mb-1">Total Quizzes</p>
          <p className="text-lg font-bold text-blue-400">{totalQuizzes}</p>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="flex-1 space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-100 mb-2">Performance Trend</h4>
          <p className="text-sm text-gray-400 mb-4">Your quiz scores over time</p>
        </div>
        <div className="-ml-10">
          <ResponsiveContainer width="100%" height={280} className="sm:h-[300px] md:h-[320px]">
            <LineChart 
              data={chartData} 
              style={{ background: 'transparent' }}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={10}
              className="text-xs sm:text-sm"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={10}
              className="text-xs sm:text-sm"
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                
                return (
                  <div
                    className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-lg shadow-xl shadow-black/20 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-200 z-50"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    }}
                  >
                    {label && (
                      <div className="text-slate-300 font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm">
                        {label}
                      </div>
                    )}
                    {payload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div 
                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                            style={{ backgroundColor: entry.color || '#3b82f6' }}
                          />
                          <span className="text-slate-300 text-xs sm:text-sm">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-slate-100 font-bold text-xs sm:text-sm">
                          {entry.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 1 }}
              name="Score %"
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-green-300 mb-1">Best Score</p>
          <p className="text-lg font-bold text-green-400">{bestScore}%</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-purple-300 mb-1">Worst Score</p>
          <p className="text-lg font-bold text-purple-400">{worstScore}%</p>
        </div>
      </div>

      {/* Recent Quiz Performance */}
      {chartData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-100 mb-3">Recent Quizzes</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {chartData.slice(-5).reverse().map((quiz, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate">
                    {quiz.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {quiz.correctAnswers}/{quiz.totalQuestions} correct
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-sm font-bold ${
                    quiz.score >= 80 ? 'text-green-400' :
                    quiz.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {quiz.score}%
                  </p>
                  <p className="text-xs text-gray-400">{quiz.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
} 