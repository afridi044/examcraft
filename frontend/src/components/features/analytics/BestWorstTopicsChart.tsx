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
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface TopicData {
  topic_name: string;
  questions_attempted: number;
  accuracy_percentage: number;
}

interface BestWorstTopicsChartProps {
  data: {
    bestTopics: TopicData[];
    worstTopics: TopicData[];
  };
}

export function BestWorstTopicsChart({ data }: BestWorstTopicsChartProps) {
  if (!data || (!data.bestTopics?.length && !data.worstTopics?.length)) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400">
        <div className="text-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <p className="text-lg sm:text-xl font-medium text-gray-100 mb-2">No Topic Data</p>
          <p className="text-gray-400 text-sm sm:text-base">Start answering questions to see your topic performance</p>
        </div>
      </div>
    );
  }

  const { bestTopics, worstTopics } = data;

  // Transform data for charts with safety checks
  const bestData = bestTopics?.map(item => ({
    name: item.topic_name || 'Unknown Topic',
    accuracy: item.accuracy_percentage || 0,
    attempts: item.questions_attempted || 0,
    correct: Math.round(((item.accuracy_percentage || 0) / 100) * (item.questions_attempted || 0)),
  })).filter(item => !isNaN(item.accuracy) && !isNaN(item.attempts)) || [];

  const worstData = worstTopics?.map(item => ({
    name: item.topic_name || 'Unknown Topic',
    accuracy: item.accuracy_percentage || 0,
    attempts: item.questions_attempted || 0,
    correct: Math.round(((item.accuracy_percentage || 0) / 100) * (item.questions_attempted || 0)),
  })).filter(item => !isNaN(item.accuracy) && !isNaN(item.attempts)) || [];

  const bestAverage = bestData.length > 0 
    ? Math.round(bestData.reduce((sum, item) => sum + (item.accuracy || 0), 0) / bestData.length)
    : 0;
  const worstAverage = worstData.length > 0 
    ? Math.round(worstData.reduce((sum, item) => sum + (item.accuracy || 0), 0) / worstData.length)
    : 0;
  const totalAttempts = [...bestData, ...worstData].reduce((sum, item) => sum + (item.attempts || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Best Topics */}
        {bestData.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-100 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                Best Performing Topics
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Your strongest subject areas</p>
            </div>
            <div className="-ml-10">
              <ResponsiveContainer width="100%" height={200} className="h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px]">
              <BarChart data={bestData} style={{ background: 'transparent' }} background={{ fill: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={10}
                  tickLine={false}
                  tick={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
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
                                style={{ backgroundColor: entry.color || '#10b981' }}
                              />
                              <span className="text-slate-300">
                                Accuracy
                              </span>
                            </div>
                            <span className="text-slate-100 font-bold">
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
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Worst Topics */}
        {worstData.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-100 mb-2 flex items-center">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-2" />
                Areas for Improvement
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Topics that need more practice</p>
            </div>
            <div className="-ml-10">
              <ResponsiveContainer width="100%" height={200} className="h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px]">
              <BarChart data={worstData} style={{ background: 'transparent' }} background={{ fill: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={10}
                  tickLine={false}
                  tick={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
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
                                style={{ backgroundColor: entry.color || '#ef4444' }}
                              />
                              <span className="text-slate-300">
                                Accuracy
                              </span>
                            </div>
                            <span className="text-slate-100 font-bold">
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
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>


    </motion.div>
  );
} 