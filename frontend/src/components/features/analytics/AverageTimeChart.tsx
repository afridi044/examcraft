'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Target } from 'lucide-react';

interface ProgressData {
  date: string;
  total_questions: number;
  correct_answers: number;
  average_time_seconds: number;
}

interface AverageTimeChartProps {
  data: ProgressData[];
}

export function AverageTimeChart({ data }: AverageTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <p className="text-base sm:text-lg font-medium text-gray-100 mb-1 sm:mb-2">No Accuracy Data</p>
          <p className="text-sm text-gray-400">Start taking quizzes to see your accuracy trends</p>
        </div>
      </div>
    );
  }

  // Transform data for charts - show accuracy percentage
  const chartData = data.map(item => ({
    date: new Date(item.date + 'Z').toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    accuracy: item.total_questions > 0 
      ? Math.round((item.correct_answers / item.total_questions) * 100) 
      : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} style={{ background: 'transparent' }} background={{ fill: 'transparent' }}>
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
                        style={{ backgroundColor: entry.color || '#10b981' }}
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
          dataKey="accuracy"
          stroke="#10b981"
          strokeWidth={2}
          className="sm:stroke-[3px]"
          name="Accuracy %"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#10b981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 