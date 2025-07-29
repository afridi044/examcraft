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
  ResponsiveContainer,
  Tooltip,
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

  // Transform data to show time properly - show seconds for short times, minutes:seconds for longer
  const chartData = data.map(item => ({
    date: new Date(item.date + 'Z').toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    questions: item.total_questions,
    correct: item.correct_answers,
    accuracy: item.total_questions > 0 
      ? Math.round((item.correct_answers / item.total_questions) * 100) 
      : 0,
    avgTime: item.average_time_seconds < 60 
      ? item.average_time_seconds // Show seconds for times under 1 minute
      : Math.round(item.average_time_seconds / 60 * 10) / 10, // Show decimal minutes for longer times
    avgTimeDisplay: item.average_time_seconds < 60 
      ? `${item.average_time_seconds}s`
      : `${Math.floor(item.average_time_seconds / 60)}:${(item.average_time_seconds % 60).toString().padStart(2, '0')}`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 h-full">
        {/* Questions & Accuracy Chart */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-100 mb-1 sm:mb-2">Questions & Accuracy</h4>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Daily learning activity and performance</p>
          </div>
          <ResponsiveContainer width="100%" height={160} className="sm:h-[200px] md:h-[240px] xl:h-[280px]">
            <AreaChart data={chartData} style={{ background: 'transparent' }} background={{ fill: 'transparent' }}>
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
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  return (
                    <div
                      className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-lg shadow-xl shadow-black/20 px-3 py-2 text-sm font-medium text-slate-200 z-50"
                      style={{
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      }}
                    >
                      {label && (
                        <div className="text-slate-300 font-semibold mb-1">
                          {label}
                        </div>
                      )}
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color || '#3b82f6' }}
                            />
                            <span className="text-slate-300">
                              {entry.name}
                            </span>
                          </div>
                          <span className="text-slate-100 font-bold">
                            {entry.name === 'Avg Time' ? entry.payload?.avgTimeDisplay : entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
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
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-100 mb-1 sm:mb-2">Average Time per Question</h4>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Time efficiency in answering questions</p>
          </div>
          <ResponsiveContainer width="100%" height={160} className="sm:h-[200px] md:h-[240px] xl:h-[280px]">
            <LineChart data={chartData} style={{ background: 'transparent' }} background={{ fill: 'transparent' }}>
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
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  return (
                    <div
                      className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 rounded-lg shadow-xl shadow-black/20 px-3 py-2 text-sm font-medium text-slate-200 z-50"
                      style={{
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      }}
                    >
                      {label && (
                        <div className="text-slate-300 font-semibold mb-1">
                          {label}
                        </div>
                      )}
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color || '#3b82f6' }}
                            />
                            <span className="text-slate-300">
                              {entry.name}
                            </span>
                          </div>
                          <span className="text-slate-100 font-bold">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
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