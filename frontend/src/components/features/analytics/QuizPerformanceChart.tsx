'use client';

import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface QuizPerformanceData {
  date: string;
  quiz_id: string;
  title: string;
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  time_spent_seconds: number;
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

  // Transform data for charts - show quizzes on x-axis
  const chartData = data.map((item, index) => ({
    quiz: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
    fullTitle: item.title,
    score: item.score_percentage,
    questions: item.total_questions,
    correct: item.correct_answers,
    timeSpent: item.time_spent_seconds,
    quizNumber: index + 1,
  }));

  const averageScore = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length)
    : 0;
  const totalQuizzes = chartData.length;
  
  // Calculate average time in seconds first, then convert to minutes and seconds
  const totalSeconds = chartData.length > 0 
    ? chartData.reduce((sum, item) => sum + item.timeSpent, 0) / chartData.length
    : 0;
  const averageMinutes = Math.floor(totalSeconds / 60);
  const averageSeconds = Math.floor(totalSeconds % 60);
  const averageTimeDisplay = averageMinutes > 0 
    ? `${averageMinutes}m ${averageSeconds}s`
    : `${averageSeconds}s`;

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
          <p className="text-xs font-medium text-orange-300 mb-1">Total Quizzes</p>
          <p className="text-lg font-bold text-orange-400">{totalQuizzes}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-center">
          <div className="flex items-center justify-center">
            <div>
              <p className="text-xs font-medium text-blue-300 mb-1">Average Time</p>
              <p className="text-lg font-bold text-blue-400">{averageTimeDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="flex-1 space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-100 mb-2">Quiz Performance</h4>
          <p className="text-sm text-gray-400 mb-4">Your scores for each completed quiz</p>
        </div>
        <div className="-ml-10">
          <ResponsiveContainer width="100%" height={280} className="sm:h-[300px] md:h-[320px]">
            <BarChart 
              data={chartData} 
              style={{ background: 'transparent' }}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="quiz" 
                stroke="#9ca3af" 
                fontSize={10}
                className="text-xs sm:text-sm"
                tickLine={false}
                axisLine={false}
                tick={false}
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
                wrapperStyle={{ backgroundColor: 'transparent', border: 'none' }}
                contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  const data = payload[0]?.payload;
                  return (
                    <div
                      className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-lg shadow-xl shadow-black/20 px-3 py-2 text-sm font-medium text-slate-200 z-50"
                      style={{
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      }}
                    >
                      <div className="text-slate-300 font-semibold mb-1">
                        {data?.fullTitle || label}
                      </div>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color || '#f59e0b' }}
                            />
                            <span className="text-slate-300">
                              {entry.name}
                            </span>
                          </div>
                          <span className="text-slate-100 font-bold">
                            {entry.value}%
                          </span>
                        </div>
                      ))}
                      {data && (
                        <div className="mt-2 pt-2 border-t border-slate-600/50 text-xs text-slate-400">
                          <div>Questions: {data.questions}</div>
                          <div>Correct: {data.correct}</div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="score"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Score %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best and Worst Score Cards */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {/* Best Score Card */}
          <div className="bg-green-500/10 border border-green-500/20 p-2.5 sm:p-3 rounded-lg hover:bg-green-500/15 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                <p className="text-xs font-medium text-green-300">Best Score</p>
              </div>
              <p className="text-lg sm:text-lg font-bold text-green-400">
                {Math.max(...chartData.map(item => item.score))}%
              </p>
            </div>
            <div className="space-y-1 sm:space-y-1">
              <p className="text-xs font-semibold text-gray-100 truncate">
                {chartData.find(item => item.score === Math.max(...chartData.map(item => item.score)))?.fullTitle}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {chartData.find(item => item.score === Math.max(...chartData.map(item => item.score)))?.correct}/{chartData.find(item => item.score === Math.max(...chartData.map(item => item.score)))?.questions} correct
                </p>
                <div className="text-xs text-green-400 font-medium">
                  Perfect!
                </div>
              </div>
            </div>
          </div>

          {/* Worst Score Card */}
          <div className="bg-red-500/10 border border-red-500/20 p-2.5 sm:p-3 rounded-lg hover:bg-red-500/15 transition-colors">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></div>
                <p className="text-xs font-medium text-red-300">Worst Score</p>
              </div>
              <p className="text-lg sm:text-lg font-bold text-red-400">
                {Math.min(...chartData.map(item => item.score))}%
              </p>
            </div>
            <div className="space-y-1 sm:space-y-1">
              <p className="text-xs font-semibold text-gray-100 truncate">
                {chartData.find(item => item.score === Math.min(...chartData.map(item => item.score)))?.fullTitle}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {chartData.find(item => item.score === Math.min(...chartData.map(item => item.score)))?.correct}/{chartData.find(item => item.score === Math.min(...chartData.map(item => item.score)))?.questions} correct
                </p>
                <div className="text-xs text-red-400 font-medium">
                  Needs Work
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Quizzes Scroll Box */}
      {chartData.length > 0 && (
        <div className="mt-6">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-100">Recent Quizzes</h4>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4">
            <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <div className="space-y-3 px-2">
                {chartData.slice(-5).reverse().map((quiz, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-800/60 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-sm font-semibold text-white truncate">
                        {quiz.fullTitle}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        {quiz.correct}/{quiz.questions} correct
                      </p>
                    </div>
                    <div className="text-right pl-4">
                      <p className={`text-sm font-bold ${
                        quiz.score >= 80 ? 'text-emerald-400' :
                        quiz.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {quiz.score}%
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {Math.floor(quiz.timeSpent / 60)}m {quiz.timeSpent % 60}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 