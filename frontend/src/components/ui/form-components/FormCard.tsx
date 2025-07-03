"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useInView } from "react-intersection-observer";

interface FormCardProps {
  children: ReactNode;
  animate?: boolean;
  delay?: number;
  className?: string;
}

export function FormCard({ 
  children, 
  animate = true, 
  delay = 0.1, 
  className = "" 
}: FormCardProps) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  const content = (
    <Card className={`bg-gray-800/50 border-gray-700/50 p-4 sm:p-5 lg:p-6 backdrop-blur-sm ${className}`}>
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </Card>
  );

  if (animate) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay }}
      >
        <div>
          {content}
        </div>
      </motion.div>
    );
  }
  
  return <div>{content}</div>;
}
