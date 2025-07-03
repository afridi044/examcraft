"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FormHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconBgClass?: string;
  titleGradient?: string;
}

export function FormHeader({
  title,
  description,
  icon,
  iconBgClass = "from-blue-500 to-teal-500",
  titleGradient = "from-blue-400 to-teal-400"
}: FormHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center space-y-2"
    >
      <motion.div 
        className="flex items-center justify-center space-x-3"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon && (
          <motion.div 
            className={`h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br ${iconBgClass} rounded-xl flex items-center justify-center shadow-lg`}
            whileHover={{ 
              boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.4)",
              rotate: [0, -10, 10, 0]
            }}
            transition={{ duration: 0.6 }}
          >
            {icon}
          </motion.div>
        )}
        <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
          {title}
        </h1>
      </motion.div>
      
      {description && (
        <motion.p 
          className="text-gray-400 max-w-2xl mx-auto px-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
