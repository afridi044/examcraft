'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';

interface ActivityData {
  date: string;
  activity_count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-100 mb-2">No Activity Data</p>
          <p className="text-gray-400">Start learning to see your activity patterns</p>
        </div>
      </div>
    );
  }

  // Create activity map for easy lookup
  const activityMap = new Map<string, number>();
  data.forEach(item => {
    activityMap.set(item.date, item.activity_count);
  });

  // Generate last 30 days
  const generateLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date: dateString,
        count: activityMap.get(dateString) || 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
      });
    }
    
    return days;
  };

  const days = generateLast30Days();

  // Calculate color intensity based on activity count
  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-slate-700/60';
    if (count <= 2) return 'bg-green-600/60';
    if (count <= 5) return 'bg-green-500/70';
    if (count <= 10) return 'bg-green-400/80';
    return 'bg-green-300/90';
  };

  // Group days by week - ensure all 30 days are displayed
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  // Ensure we have exactly 30 days (5 rows × 6 columns)
  const totalDays = weeks.reduce((sum, week) => sum + week.length, 0);
  if (totalDays !== 30) {
    console.warn(`Expected 30 days but got ${totalDays} days in heatmap`);
  }

  // Calculate stats from the last 30 days of data (now limited by backend)
  const totalActivities = data.reduce((sum, item) => sum + item.activity_count, 0);
  // Calculate active days based on the generated 30-day grid, not the backend data array
  const activeDays = days.filter(day => day.count > 0).length;
  const averagePerDay = activeDays > 0 ? Math.round(totalActivities / activeDays) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col bg-transparent relative z-10 overflow-hidden"
    >
      {/* Header with Legend */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex space-x-0.5 sm:space-x-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-700/60 rounded-sm border border-slate-600/40"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600/60 rounded-sm border border-slate-600/40"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500/70 rounded-sm border border-slate-600/40"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400/80 rounded-sm border border-slate-600/40"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-300/90 rounded-sm border border-slate-600/40"></div>
              </div>
              <span>More</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
            Last 30 days
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 flex flex-col justify-center relative z-20 min-h-0">
        <div className="space-y-1 sm:space-y-2 max-w-full overflow-visible">
          {weeks.map((week, weekIndex) => (
            <motion.div
              key={weekIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: weekIndex * 0.05 }}
              className="flex space-x-0.5 sm:space-x-1 justify-center sm:justify-start"
            >
              {week.map((day, dayIndex) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: weekIndex * 0.05 + dayIndex * 0.02 
                  }}
                  className={`
                    relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg border border-slate-600/40
                    ${getColorIntensity(day.count)}
                    hover:scale-110 transition-transform duration-200 cursor-pointer
                    flex items-center justify-center text-xs font-medium
                    ${day.count > 0 ? 'text-white' : 'text-gray-400'}
                    shadow-sm hover:shadow-md z-30 relative
                  `}
                  title={`${day.dayName}, ${day.dayNumber}: ${day.count} activities`}
                >
                  {day.count > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: weekIndex * 0.05 + dayIndex * 0.02 + 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="text-xs font-bold hidden sm:block">
                        {day.count > 9 ? '9+' : day.count}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-1.5 sm:gap-3 relative z-20">
        <div className="bg-blue-500/10 border border-blue-500/20 p-1.5 sm:p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-blue-300 mb-0.5 sm:mb-1">Total Activities</p>
          <p className="text-sm sm:text-lg font-bold text-blue-400">{totalActivities}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 p-1.5 sm:p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-green-300 mb-0.5 sm:mb-1">Active Days</p>
          <p className="text-sm sm:text-lg font-bold text-green-400">{activeDays}/30</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 p-1.5 sm:p-3 rounded-lg text-center">
          <p className="text-xs font-medium text-purple-300 mb-0.5 sm:mb-1">Avg/Day</p>
          <p className="text-sm sm:text-lg font-bold text-purple-400">{averagePerDay}</p>
        </div>
      </div>
    </motion.div>
  );
} 