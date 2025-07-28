'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
  const totalQuestions = chartData.reduce((sum, item) => sum + item.totalQuestions, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-orange-300 mb-1">Average Score</p>
          <p className="text-2xl font-bold text-orange-400">{averageScore}%</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-300 mb-1">Total Quizzes</p>
          <p className="text-2xl font-bold text-blue-400">{totalQuizzes}</p>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="flex-1 space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-100 mb-2">Performance Trend</h4>
          <p className="text-sm text-gray-400 mb-4">Your quiz scores over time</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} style={{ background: 'transparent' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              }}
              labelStyle={{ color: '#9ca3af', fontWeight: '600' }}
              formatter={(value: any, name: any, props: any) => [
                `${value}%`,
                `${props.payload.title}`
              ]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2 }}
              name="Score %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-green-300 mb-1">Best Score</p>
          <p className="text-xl font-bold text-green-400">{bestScore}%</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-purple-300 mb-1">Total Questions</p>
          <p className="text-xl font-bold text-purple-400">{totalQuestions}</p>
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