"use client";
import { useQuizConfig } from "@/store/useQuizConfig";
import React from "react";
import { Input } from "@/components/ui/input";

export default function InputBox() {
  const addQuestionNumber = useQuizConfig(
    (state: any) => state.addQuestionNumber
  );

  return (
    <div className="w-full max-w-xs">
        <Input
          type="number"
          defaultValue={10}
          max={50}
          min={10}
          onChange={(e) => addQuestionNumber(e.currentTarget.value ?? "")}
          className="bg-secondary/50 border-border/50 backdrop-blur-sm h-12 text-center text-lg font-semibold w-full transition-all focus:ring-2 focus:ring-primary/20 hover:bg-secondary/80"
          placeholder="10"
        />
    </div>
  );
}
