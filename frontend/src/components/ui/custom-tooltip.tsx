'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  children?: React.ReactNode;
  className?: string;
  formatter?: (value: any, name: string, props?: any) => [string, string];
}

export function CustomTooltip({ 
  active, 
  payload, 
  label, 
  children,
  className = "",
  formatter
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`
          bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 
          rounded-lg shadow-xl shadow-black/20 px-3 py-2 
          text-sm font-medium text-slate-200 z-50
          ${className}
        `}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        }}
      >
        {children || (
          <>
            {label && (
              <div className="text-slate-300 font-semibold mb-1">
                {label}
              </div>
            )}
            {payload.map((entry: any, index: number) => {
              let displayValue = entry.value;
              let displayName = entry.name;
              
              if (formatter) {
                const [formattedValue, formattedName] = formatter(entry.value, entry.name, entry);
                displayValue = formattedValue;
                displayName = formattedName;
              }
              
              return (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color || '#3b82f6' }}
                    />
                    <span className="text-slate-300">
                      {displayName}
                    </span>
                  </div>
                  <span className="text-slate-100 font-bold">
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
} 