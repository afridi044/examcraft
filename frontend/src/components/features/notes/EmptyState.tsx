import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[500px]"
    >
      <div className="relative max-w-md w-full">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl"></div>
        
        <Card className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-800/90 border-slate-700/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Premium Icon */}
            <motion.div 
              className="relative mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <span className="text-3xl">{icon}</span>
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h3 
              className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h3>

            {/* Description */}
            <motion.p 
              className="text-gray-400 text-base leading-relaxed mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {description}
            </motion.p>

            {/* Premium Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => router.push(actionHref)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {actionLabel}
              </Button>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 h-2 w-2 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute top-8 right-6 h-3 w-3 bg-purple-400 rounded-full opacity-40"></div>
            <div className="absolute bottom-6 left-6 h-2 w-2 bg-pink-400 rounded-full opacity-50"></div>
            <div className="absolute bottom-8 right-4 h-3 w-3 bg-green-400 rounded-full opacity-30"></div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}; 