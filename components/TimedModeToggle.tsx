"use client";

import { useQuizConfig } from "@/store/useQuizConfig";
import type { QuizStore } from "@/types";
import { Timer, TimerOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function TimedModeToggle() {
  const timedMode = useQuizConfig((state: QuizStore) => state.config.timedMode);
  const setTimedMode = useQuizConfig((state: QuizStore) => state.setTimedMode);

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Timed Mode
      </label>
      <button
        onClick={() => setTimedMode(!timedMode)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-200",
          timedMode
            ? "bg-primary/10 border-primary text-primary"
            : "bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary/80"
        )}
      >
        {timedMode ? (
          <>
            <Timer className="w-5 h-5" />
            <span className="font-medium">15s per question</span>
          </>
        ) : (
          <>
            <TimerOff className="w-5 h-5" />
            <span className="font-medium">No time limit</span>
          </>
        )}
      </button>
    </div>
  );
}
