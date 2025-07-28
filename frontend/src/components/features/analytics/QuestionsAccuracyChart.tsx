'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ProgressData {
  date: string;
  total_questions: number;
  correct_answers: number;
  average_time_seconds: number;
}

interface QuestionsAccuracyChartProps {
  data: ProgressData[];
}

export function QuestionsAccuracyChart({ data }: QuestionsAccuracyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <p className="text-base sm:text-lg font-medium text-gray-100 mb-1 sm:mb-2">No Progress Data</p>
          <p className="text-sm text-gray-400">Start taking quizzes to see your learning progress</p>
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
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
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
                      {entry.value}
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
          strokeWidth={2}
          className="sm:stroke-[3px]"
          name="Questions"
        />
        <Area
          type="monotone"
          dataKey="accuracy"
          stroke="#10b981"
          fill="url(#accuracyGradient)"
          strokeWidth={2}
          className="sm:stroke-[3px]"
          name="Accuracy %"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
} 