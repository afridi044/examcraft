'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface ProgressData {
  date: string;
  total_questions: number;
  correct_answers: number;
  average_time_seconds: number;
}

interface ProgressOverTimeChartProps {
  data: ProgressData[];
}

export function ProgressOverTimeChart({ data }: ProgressOverTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-100 mb-2">No Progress Data</p>
          <p className="text-gray-400">Start taking quizzes to see your learning progress</p>
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
    questions: item.total_questions,
    correct: item.correct_answers,
    accuracy: item.total_questions > 0 
      ? Math.round((item.correct_answers / item.total_questions) * 100) 
      : 0,
    avgTime: Math.round(item.average_time_seconds / 60), // Convert to minutes
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Questions & Accuracy Chart */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2">Questions & Accuracy</h4>
            <p className="text-sm text-gray-400 mb-4">Daily learning activity and performance</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="questionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                formatter={(value: any, name: any) => [
                  name === 'Questions' ? `${value} questions` : `${value}%`,
                  name
                ]}
              />
              <Area
                type="monotone"
                dataKey="questions"
                stroke="#3b82f6"
                fill="url(#questionsGradient)"
                strokeWidth={3}
                name="Questions"
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                fill="url(#accuracyGradient)"
                strokeWidth={3}
                name="Accuracy %"
              />
            </AreaChart>
          </ResponsiveContainer>
          

        </div>

        {/* Time per Question Chart */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2">Average Time per Question</h4>
            <p className="text-sm text-gray-400 mb-4">Time efficiency in answering questions</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
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
                formatter={(value: any) => [`${value} minutes`, 'Avg Time']}
              />
              <Line
                type="monotone"
                dataKey="avgTime"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2 }}
                name="Avg Time (min)"
              />
            </LineChart>
          </ResponsiveContainer>
          

        </div>
      </div>
    </motion.div>
  );
} 