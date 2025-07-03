import React from "react";
import clsx from "clsx";

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  className = "",
  ...props
}) => (
  <button
    className={clsx(
      "inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold tracking-wide text-white",
      "bg-gradient-to-r from-emerald-700 via-green-800 to-teal-800",
      "border border-emerald-900/40 shadow-md backdrop-blur-sm",
      "transition-all duration-200",
      "hover:from-emerald-800 hover:to-teal-900 hover:shadow-lg hover:ring-2 hover:ring-emerald-800/40",
      "active:scale-95",
      "[text-shadow:_0_1px_8px_rgba(0,0,0,0.18)]",
      className
    )}
    {...props}
  >
    {children}
  </button>
); 