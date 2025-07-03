"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  iconColor?: string;
  children: ReactNode;
  animate?: boolean;
  delay?: number;
}

export function FormSection({ 
  title, 
  icon, 
  iconColor = "from-cyan-500 to-cyan-600", 
  children, 
  animate = true, 
  delay = 0.3 
}: FormSectionProps) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  const content = (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center space-x-3 mb-2 sm:mb-3">
        {icon && (
          <motion.div 
            className={`h-8 w-8 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center`}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 0.4 }}
          >
            {icon}
          </motion.div>
        )}
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
  
  if (animate) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay, duration: 0.6 }}
      >
        {content}
      </motion.div>
    );
  }
  
  return <>{content}</>;
}
