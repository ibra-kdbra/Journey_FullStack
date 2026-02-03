"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConfigSelectOption {
  value: string | number;
  label: string;
}

interface ConfigSelectProps {
  label: string;
  value: string;
  options: ConfigSelectOption[];
  onSelect: (value: string | number, label?: string) => void;
  placeholder?: string;
  className?: string;
}

export function ConfigSelect({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select...",
  className,
}: ConfigSelectProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">
        {label}
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-between gap-2 w-full px-4 py-2.5 
              bg-secondary/50 hover:bg-secondary/80
              border border-border/50 rounded-xl
              text-sm font-medium text-foreground
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <span className="truncate">{value || placeholder}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center"
          className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[280px] overflow-y-auto bg-popover/95 backdrop-blur-md border-border shadow-xl rounded-xl"
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSelect(option.value, option.label)}
              className={cn(
                "cursor-pointer transition-colors",
                value === option.label && "bg-primary/10 text-primary"
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
