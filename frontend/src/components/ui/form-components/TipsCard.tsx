"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Rocket } from "lucide-react";

interface TipsCardProps {
  icon: ReactNode;
  title: string;
  tips: string[];
  gradientFrom?: string;
  gradientTo?: string;
  textColor?: string;
}

export function TipsCard({
  icon,
  title,
  tips,
  gradientFrom = "teal",
  gradientTo = "blue",
  textColor = "text-teal-300"
}: TipsCardProps) {
  // Map gradient colors to proper Tailwind classes
  const getGradientClasses = (from: string, to: string) => {
    const gradients: Record<string, string> = {
      'teal': 'from-teal-500/10 to-teal-500/10',
      'blue': 'from-blue-500/10 to-blue-500/10',
      'purple': 'from-purple-500/10 to-purple-500/10',
      'pink': 'from-pink-500/10 to-pink-500/10',
      'green': 'from-green-500/10 to-green-500/10',
      'emerald': 'from-emerald-500/10 to-emerald-500/10',
      'cyan': 'from-cyan-500/10 to-cyan-500/10',
      'orange': 'from-orange-500/10 to-orange-500/10',
      'red': 'from-red-500/10 to-red-500/10',
      'indigo': 'from-indigo-500/10 to-indigo-500/10',
    };
    
    const fromClass = gradients[from] || 'from-teal-500/10';
    const toClass = gradients[to] || 'to-blue-500/10';
    
    return `bg-gradient-to-r ${fromClass} ${toClass}`;
  };

  const getBorderClasses = (from: string) => {
    const borders: Record<string, string> = {
      'teal': 'border-teal-500/20',
      'blue': 'border-blue-500/20',
      'purple': 'border-purple-500/20',
      'pink': 'border-pink-500/20',
      'green': 'border-green-500/20',
      'emerald': 'border-emerald-500/20',
      'cyan': 'border-cyan-500/20',
      'orange': 'border-orange-500/20',
      'red': 'border-red-500/20',
      'indigo': 'border-indigo-500/20',
    };
    
    return borders[from] || 'border-teal-500/20';
  };

  const getIconBgClasses = (from: string, to: string) => {
    const iconBgs: Record<string, string> = {
      'teal': 'from-teal-500 to-teal-600',
      'blue': 'from-blue-500 to-blue-600',
      'purple': 'from-purple-500 to-purple-600',
      'pink': 'from-pink-500 to-pink-600',
      'green': 'from-green-500 to-green-600',
      'emerald': 'from-emerald-500 to-emerald-600',
      'cyan': 'from-cyan-500 to-cyan-600',
      'orange': 'from-orange-500 to-orange-600',
      'red': 'from-red-500 to-red-600',
      'indigo': 'from-indigo-500 to-indigo-600',
    };
    
    const fromClass = iconBgs[from] || 'from-teal-500';
    const toClass = iconBgs[to] || 'to-blue-500';
    
    return `bg-gradient-to-br ${fromClass} ${toClass}`;
  };

  const gradientClasses = getGradientClasses(gradientFrom, gradientTo);
  const borderClasses = getBorderClasses(gradientFrom);
  const iconBgClasses = getIconBgClasses(gradientFrom, gradientTo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div>
        <Card className={`${gradientClasses} ${borderClasses} p-4 sm:p-6 backdrop-blur-sm`}>
          <div className="flex items-start space-x-4">
            <motion.div 
              className={`h-8 w-8 ${iconBgClasses} rounded-lg flex items-center justify-center flex-shrink-0 mt-1`}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.6 }}
            >
              {icon}
            </motion.div>
            <div className="space-y-2">
              <motion.h3 
                className={`text-base sm:text-lg font-bold ${textColor} flex items-center space-x-2`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Rocket className="w-4 h-4" />
                </motion.div>
                <span>{title}</span>
              </motion.h3>
              <motion.ul 
                className="text-sm text-gray-300 space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {tips.map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                    whileHover={{ x: 5, color: "#14b8a6" }}
                    className="transition-colors duration-200"
                  >
                    • {tip}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
