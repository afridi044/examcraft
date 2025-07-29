"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleClick = () => {
      console.log('🔘 Switch clicked! Current state:', checked);
      onCheckedChange?.(!checked);
    };

    return (
      <div 
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95 ${
          checked ? 'bg-blue-500' : 'bg-slate-600'
        }`}
        onClick={handleClick}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => {
            console.log('📝 Input onChange triggered:', e.target.checked);
            onCheckedChange?.(e.target.checked);
          }}
          ref={ref}
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-out transform",
            checked ? "translate-x-5 scale-105" : "translate-x-0 scale-100"
          )}
        />
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch }; 