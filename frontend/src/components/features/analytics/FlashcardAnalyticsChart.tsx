'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { BookOpen, Brain } from 'lucide-react';

interface FlashcardData {
  totalFlashcards: number;
  masteredFlashcards: number;
  learningFlashcards: number;
  newFlashcards: number;
  masteryDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
  recentReviews: Array<{
    date: string;
    cards_reviewed: number;
    correct_answers: number;
  }>;
}

interface FlashcardAnalyticsChartProps {
  data: FlashcardData;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export function FlashcardAnalyticsChart({ data }: FlashcardAnalyticsChartProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-100 mb-2">No Flashcard Data</p>
          <p className="text-gray-400">Start creating flashcards to see your learning progress</p>
        </div>
      </div>
    );
  }

  const { 
    totalFlashcards, 
    masteredFlashcards, 
    learningFlashcards, 
    newFlashcards,
    masteryDistribution,
    recentReviews 
  } = data;

  // Transform mastery data for charts
  const masteryData = masteryDistribution?.map(item => ({
    name: item.level,
    value: item.count,
    percentage: item.percentage,
  })) || [];

  // Transform review data for chart
  const chartData = recentReviews?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    cardsReviewed: item.cards_reviewed,
    correctAnswers: item.correct_answers,
    accuracy: item.cards_reviewed > 0 
      ? Math.round((item.correct_answers / item.cards_reviewed) * 100) 
      : 0,
  })) || [];

  const masteryRate = totalFlashcards > 0 
    ? Math.round((masteredFlashcards / totalFlashcards) * 100)
    : 0;
  const totalReviews = recentReviews?.reduce((sum, item) => sum + (item.cards_reviewed || 0), 0) || 0;
  const averageAccuracy = recentReviews?.length > 0
    ? Math.round(recentReviews.reduce((sum, item) => 
        sum + ((item.cards_reviewed || 0) > 0 ? ((item.correct_answers || 0) / (item.cards_reviewed || 1)) * 100 : 0), 0
      ) / recentReviews.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-yellow-300 mb-1">Total Flashcards</p>
          <p className="text-lg font-bold text-yellow-400">{totalFlashcards}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-green-300 mb-1">Mastery Rate</p>
          <p className="text-lg font-bold text-green-400">{masteryRate}%</p>
        </div>
      </div>

      {/* Mastery Distribution */}
      {masteryData.length > 0 && (
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2">Mastery Distribution</h4>
            <p className="text-sm text-gray-400 mb-4">How well you know your flashcards</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="-ml-10">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart style={{ background: 'transparent' }} background={{ fill: 'transparent' }} className="h-[160px] sm:h-[180px]">
                  <Pie
                    data={masteryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }) => {
                      // Clean up the name display and make it more compact
                      let cleanName = name;
                      if (name === 'r_review') {
                        cleanName = 'reviewing';
                      } else if (name === 'under_review') {
                        cleanName = 'reviewing';
                      }
                      return cleanName;
                    }}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {masteryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    wrapperStyle={{ backgroundColor: 'transparent', border: 'none' }}
                    contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                    cursor={false}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      
                      return (
                        <div
                          className="px-3 py-2 text-sm font-medium text-slate-200 z-50"
                          style={{
                            backgroundColor: '#0f172a',
                            background: '#0f172a',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
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
                                  {entry.payload.name}
                                </span>
                              </div>
                              <span className="text-slate-100 font-bold">
                                {entry.value} cards
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Mastery List */}
            <div className="space-y-3">
              {masteryData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-100 capitalize">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.value} cards
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-200">
                      {item.percentage}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Review Activity */}
      {chartData.length > 0 && (
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2">Flashcard Creation Activity</h4>
            <p className="text-sm text-gray-400 mb-4">Your daily flashcard creation activity (last 30 days)</p>
          </div>
          <div className="-ml-10">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={chartData} 
                style={{ background: 'transparent' }} 
                background={{ fill: 'transparent' }} 
                className="h-[160px] sm:h-[180px]"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={11}
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
                      className="px-3 py-2 text-sm font-medium text-slate-200 z-50"
                      style={{
                        backgroundColor: '#0f172a',
                        background: '#0f172a',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
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
                              Cards Created
                            </span>
                          </div>
                          <span className="text-slate-100 font-bold">
                            {entry.value} cards
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="cardsReviewed"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Cards Created"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-blue-300 mb-1">Cards Created</p>
          <p className="text-lg font-bold text-blue-400">{totalReviews}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-purple-300 mb-1">Active Days</p>
          <p className="text-lg font-bold text-purple-400">{chartData.length}</p>
        </div>
      </div>
    </motion.div>
  );
} 