import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuizActionButtonProps {
  href?: string;
  onClick?: () => void;
  variant: "review" | "retake" | "continue" | "start" | "delete" | "disabled";
  icon: LucideIcon;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  review: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30",
  retake: "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30",
  continue: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30",
  start: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30",
  delete: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 disabled:opacity-50",
  disabled: "bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed",
};

export function QuizActionButton({
  href,
  onClick,
  variant,
  icon: Icon,
  children,
  disabled = false,
  loading = false,
  className = "",
}: QuizActionButtonProps) {
  const buttonContent = (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantStyles[variant]} w-full sm:w-auto ${className}`}
    >
      {loading ? (
        <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-current border-t-transparent" />
      ) : (
        <Icon className="h-3 w-3 mr-1" />
      )}
      <span className="hidden sm:inline">{children}</span>
      <span className="sm:hidden">
        {loading ? "..." : children}
      </span>
    </Button>
  );

  if (href) {
    return (
      <Link href={href} className="w-full sm:w-auto">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
} 