"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, Trophy, Zap, Users, Brain, ArrowRight, RotateCcw } from "lucide-react";
import { ReactNode } from "react";

export interface SuccessScreenProps {
  // Core props
  title: string;
  subtitle: string;
  icon?: ReactNode;
  iconColor?: 'green' | 'blue' | 'purple' | 'yellow';
  
  // Content
  details?: {
    title: string;
    stats: Array<{
      icon: ReactNode;
      label: string;
      value: string;
      color?: string;
    }>;
  };
  
  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  
  // Optional
  showConfetti?: boolean;
  confettiColors?: string[];
}

const getIconColors = (color: string) => {
  switch (color) {
    case 'green':
      return {
        gradient: 'from-green-500 via-emerald-500 to-teal-500',
        glow: 'from-green-400 to-emerald-500',
        border: 'border-green-400/20',
        shadow: 'shadow-green-500/30',
        text: 'from-green-400 via-emerald-400 to-teal-400'
      };
    case 'blue':
      return {
        gradient: 'from-blue-500 via-indigo-500 to-purple-500',
        glow: 'from-blue-400 to-indigo-500',
        border: 'border-blue-400/20',
        shadow: 'shadow-blue-500/30',
        text: 'from-blue-400 via-indigo-400 to-purple-400'
      };
    case 'purple':
      return {
        gradient: 'from-purple-500 via-pink-500 to-rose-500',
        glow: 'from-purple-400 to-pink-500',
        border: 'border-purple-400/20',
        shadow: 'shadow-purple-500/30',
        text: 'from-purple-400 via-pink-400 to-rose-400'
      };
    case 'yellow':
      return {
        gradient: 'from-yellow-500 via-amber-500 to-orange-500',
        glow: 'from-yellow-400 to-amber-500',
        border: 'border-yellow-400/20',
        shadow: 'shadow-yellow-500/30',
        text: 'from-yellow-400 via-amber-400 to-orange-400'
      };
    default:
      return {
        gradient: 'from-green-500 via-emerald-500 to-teal-500',
        glow: 'from-green-400 to-emerald-500',
        border: 'border-green-400/20',
        shadow: 'shadow-green-500/30',
        text: 'from-green-400 via-emerald-400 to-teal-400'
      };
  }
};

export function SuccessScreen({
  title,
  subtitle,
  icon,
  iconColor = 'green',
  details,
  primaryAction,
  secondaryActions = [],
  showConfetti = false,
  confettiColors = ['#a21caf', '#f472b6', '#6366f1', '#f59e42', '#10b981']
}: SuccessScreenProps) {
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const colors = getIconColors(iconColor);

  return (
    <div className="relative">
      <div className="relative z-10 max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          {/* Success Icon */}
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
            >
              {/* Outer glow ring */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow} rounded-full blur-lg opacity-40 animate-pulse`}></div>
              
              {/* Main icon container */}
              <div className={`relative h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-xl ${colors.shadow} border-2 ${colors.border}`}>
                {icon || <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-lg" />}
              </div>
              
              {/* Floating particles */}
              <motion.div
                className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full"
                animate={{
                  y: [-3, -8, -3],
                  x: [-2, 2, -2],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute -bottom-1 -left-1 h-1.5 w-1.5 bg-pink-400 rounded-full"
                animate={{
                  y: [-2, -6, -2],
                  x: [-1, 1, -1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className={`bg-gradient-to-r ${colors.text} bg-clip-text text-transparent`}>
                {title}
              </span>
            </h1>
            <motion.p
              className="text-gray-300 max-w-lg mx-auto text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Details Card */}
        {details && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={headerInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center"
          >
            <Card className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50 backdrop-blur-xl p-5 sm:p-6 max-w-md w-full shadow-xl">
              {/* Card glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow.replace('400', '500').replace('500', '10')} rounded-lg blur-lg`}></div>
              
              <div className="relative z-10 space-y-5">
                {/* Details Title */}
                <div className="text-center space-y-3">
                  <motion.h2 
                    className="text-xl sm:text-2xl font-bold text-white"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    {details.title}
                  </motion.h2>
                  
                  {/* Stats */}
                  <motion.div 
                    className="flex items-center justify-center space-x-4 text-gray-300"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.4 }}
                  >
                    {details.stats.map((stat, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-md border border-gray-700/50">
                        <div className={`h-4 w-4 ${stat.color || 'text-green-400'}`}>
                          {stat.icon}
                        </div>
                        <span className="text-sm font-medium">{stat.value} {stat.label}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        {(primaryAction || secondaryActions.length > 0) && (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {/* Primary Action Button */}
            {primaryAction && (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={primaryAction.onClick}
                  className={`w-full relative overflow-hidden bg-gradient-to-r ${colors.gradient} hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-semibold py-3 text-base min-h-[48px] shadow-lg hover:shadow-green-500/25 transition-all duration-300 border-0 group`}
                >
                  {/* Button glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow.replace('400', '500').replace('500', '20')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center space-x-2">
                    {primaryAction.icon || <Zap className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />}
                    <span className="font-semibold">{primaryAction.label}</span>
                  </div>
                </Button>
              </motion.div>
            )}

            {/* Secondary Action Buttons */}
            {secondaryActions.length > 0 && (
              <div className={`grid gap-3 ${secondaryActions.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {secondaryActions.map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={action.onClick}
                      variant="outline"
                      className="w-full relative overflow-hidden border border-gray-600/50 bg-gray-800/30 text-gray-200 hover:bg-gray-700/50 hover:border-gray-500/50 hover:text-white py-2.5 min-h-[40px] backdrop-blur-sm transition-all duration-300 group text-sm"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {action.icon || <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />}
                        <span className="font-medium">{action.label}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 