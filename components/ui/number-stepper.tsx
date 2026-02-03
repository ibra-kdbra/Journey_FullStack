"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function NumberStepper({
  label,
  value,
  onChange,
  min = 5,
  max = 50,
  step = 5,
  className,
}: NumberStepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-1 bg-secondary/30 rounded-xl p-1">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
            value <= min 
              ? "text-muted-foreground/40 cursor-not-allowed" 
              : "text-foreground hover:bg-secondary active:scale-95"
          )}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <div className="flex items-center justify-center min-w-[60px] px-2">
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {value}
          </span>
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
            value >= max 
              ? "text-muted-foreground/40 cursor-not-allowed" 
              : "text-foreground hover:bg-secondary active:scale-95"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
