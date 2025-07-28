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
} from 'recharts';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface TopicData {
  topic_name: string;
  total_attempts: number;
  correct_attempts: number;
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
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-100 mb-2">No Topic Data</p>
          <p className="text-gray-400">Start answering questions to see your topic performance</p>
        </div>
      </div>
    );
  }

  const { bestTopics, worstTopics } = data;

  // Transform data for charts
  const bestData = bestTopics?.map(item => ({
    name: item.topic_name,
    accuracy: item.accuracy_percentage,
    attempts: item.total_attempts,
    correct: item.correct_attempts,
  })) || [];

  const worstData = worstTopics?.map(item => ({
    name: item.topic_name,
    accuracy: item.accuracy_percentage,
    attempts: item.total_attempts,
    correct: item.correct_attempts,
  })) || [];

  const bestAverage = bestData.length > 0 
    ? Math.round(bestData.reduce((sum, item) => sum + item.accuracy, 0) / bestData.length)
    : 0;
  const worstAverage = worstData.length > 0 
    ? Math.round(worstData.reduce((sum, item) => sum + item.accuracy, 0) / worstData.length)
    : 0;
  const totalAttempts = [...bestData, ...worstData].reduce((sum, item) => sum + item.attempts, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-green-300 mb-1">Best Average</p>
          <p className="text-2xl font-bold text-green-400">{bestAverage}%</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-red-300 mb-1">Worst Average</p>
          <p className="text-2xl font-bold text-red-400">{worstAverage}%</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-300 mb-1">Total Attempts</p>
          <p className="text-2xl font-bold text-blue-400">{totalAttempts}</p>
        </div>
      </div>

      {/* Best Topics */}
      {bestData.length > 0 && (
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
              Best Performing Topics
            </h4>
            <p className="text-sm text-gray-400 mb-4">Your strongest subject areas</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
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
                formatter={(value: any, name: any, props: any) => [
                  `${value}%`,
                  `${name} (${props.payload.attempts} attempts)`
                ]}
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
      )}

      {/* Worst Topics */}
      {worstData.length > 0 && (
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
              <TrendingDown className="h-5 w-5 text-red-400 mr-2" />
              Areas for Improvement
            </h4>
            <p className="text-sm text-gray-400 mb-4">Topics that need more attention</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={worstData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
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
                formatter={(value: any, name: any, props: any) => [
                  `${value}%`,
                  `${name} (${props.payload.attempts} attempts)`
                ]}
              />
              <Bar
                dataKey="accuracy"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                name="Accuracy %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Topic Lists */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Topics List */}
        {bestData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-100 mb-3 flex items-center">
              <Trophy className="h-4 w-4 text-yellow-400 mr-2" />
              Top Performers
            </h4>
            <div className="space-y-2">
              {bestData.slice(0, 5).map((topic, index) => (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-green-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-100 truncate">
                        {topic.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {topic.correct}/{topic.attempts} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">
                      {topic.accuracy}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Worst Topics List */}
        {worstData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-100 mb-3 flex items-center">
              <TrendingDown className="h-4 w-4 text-red-400 mr-2" />
              Need Focus
            </h4>
            <div className="space-y-2">
              {worstData.slice(0, 5).map((topic, index) => (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-red-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-100 truncate">
                        {topic.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {topic.correct}/{topic.attempts} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">
                      {topic.accuracy}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 