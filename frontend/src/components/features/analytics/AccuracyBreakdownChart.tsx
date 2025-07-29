'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface AccuracyData {
  byDifficulty: Array<{
    difficulty: number;
    total_attempts: number;
    correct_attempts: number;
    accuracy_percentage: number;
  }>;
}

interface AccuracyBreakdownChartProps {
  data: AccuracyData;
}

export function AccuracyBreakdownChart({ data }: AccuracyBreakdownChartProps) {
  if (!data || !data.byDifficulty?.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-100 mb-2">No Accuracy Data</p>
          <p className="text-gray-400">Start answering questions to see your accuracy breakdown</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const difficultyData = data.byDifficulty?.map(item => ({
    name: `Level ${item.difficulty}`,
    accuracy: item.accuracy_percentage,
    attempts: item.total_attempts,
    correct: item.correct_attempts,
  })) || [];

  const totalAttempts = difficultyData.reduce((sum, item) => sum + item.attempts, 0);
  const averageAccuracy = difficultyData.length > 0 
    ? Math.round(difficultyData.reduce((sum, item) => sum + item.accuracy, 0) / difficultyData.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-10">
        <div className="bg-blue-500/10 border border-blue-500/20 p-2 sm:p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-blue-300 mb-0.5">Total Attempts</p>
          <p className="text-sm sm:text-lg font-bold text-blue-400">{totalAttempts}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 p-2 sm:p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-green-300 mb-0.5">Average Accuracy</p>
          <p className="text-sm sm:text-lg font-bold text-green-400">{averageAccuracy}%</p>
        </div>
      </div>

      {/* Difficulty Level Accuracy */}
      {difficultyData.length > 0 && (
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2">By Difficulty Level</h4>
            <p className="text-sm text-gray-400 mb-4">How well you perform at different difficulty levels</p>
          </div>
          <div className="-ml-10">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={difficultyData} 
                style={{ background: 'transparent' }} 
                background={{ fill: 'transparent' }} 
                className="h-[180px] sm:h-[200px]"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  className="text-xs sm:text-sm"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12}
                  className="text-xs sm:text-sm"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  wrapperStyle={{ backgroundColor: 'transparent', border: 'none' }}
                  contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                  cursor={false}
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
                <Bar
                  dataKey="accuracy"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  className="sm:radius-[6px,6px,0,0]"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
} 