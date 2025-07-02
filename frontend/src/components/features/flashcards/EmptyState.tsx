import { motion } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  showBackButton = false,
  onBack,
}: EmptyStateProps) {
  return (
    <motion.div
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 sm:p-8 text-center my-6 sm:my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-gray-400 mb-6">
        {description}
      </p>
      <div className="flex gap-3 justify-center">
        <motion.button
          onClick={onAction}
          className="px-4 sm:px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={18} />
          <span>{actionText}</span>
        </motion.button>
        {showBackButton && onBack && (
          <motion.button
            onClick={onBack}
            className="px-4 sm:px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            <span>Back to Topics</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
} 