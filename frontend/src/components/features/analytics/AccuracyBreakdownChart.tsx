'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { Target, BarChart3 } from 'lucide-react';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-300 mb-1">Total Attempts</p>
          <p className="text-2xl font-bold text-blue-400">{totalAttempts}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-green-300 mb-1">Average Accuracy</p>
          <p className="text-2xl font-bold text-green-400">{averageAccuracy}%</p>
        </div>
      </div>

      {/* Difficulty Level Accuracy */}
      {difficultyData.length > 0 && (
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2">By Difficulty Level</h4>
            <p className="text-sm text-gray-400 mb-4">How well you perform at different difficulty levels</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={difficultyData} style={{ background: 'transparent' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={11}
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
                  />
                  <Bar
                    dataKey="accuracy"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Accuracy %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart style={{ background: 'transparent' }}>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, accuracy }) => `${name}: ${accuracy}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="accuracy"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
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
                      `${props.payload.name}`
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 