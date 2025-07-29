import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export const CreateNoteButton: React.FC = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="fixed bottom-6 left-6 z-50"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-xl"></div>
      
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={() => router.push("/notes/create")}
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
        >
          <div className="relative">
            <Plus className="h-7 w-7" />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </motion.div>
          </div>
        </Button>
      </motion.div>
    </motion.div>
  );
}; 