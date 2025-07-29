import React, { useState, useRef, useEffect } from "react";
import { Plus, X, BarChart3, Brain, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface AddNewButtonProps {}

export const AddNewButton: React.FC<AddNewButtonProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      id: "quiz",
      label: "Create Quiz",
      description: "Design custom assessments",
      href: "/quiz/create",
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
    },
    {
      id: "flashcard",
      label: "Generate Flashcards",
      description: "AI-powered study cards",
      href: "/flashcards/create",
      icon: Brain,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
    },
    {
      id: "note",
      label: "Add Study Notes",
      description: "Capture your insights",
      href: "/notes/create",
      icon: BookOpen,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72 bg-gray-900/95 backdrop-blur-md border border-gray-600/60 rounded-2xl shadow-2xl shadow-black/50"
          >
            <div className="p-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={item.href}>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700/60 hover:border-gray-600/30 border border-transparent transition-all duration-200 group"
                      >
                        <div className={`h-10 w-10 ${item.bgColor} border ${item.borderColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                          <Icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-white">{item.label}</div>
                          <div className="text-xs text-gray-300">{item.description}</div>
                        </div>
                      </button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
}; 