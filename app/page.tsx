"use client";
import DropdownOptions from "@/components/DropdownOptions";
import Button from "@/components/Buttons";
import { NumberStepper } from "@/components/ui/number-stepper";
import { TimedModeToggle } from "@/components/TimedModeToggle";
import { useQuizConfig } from "@/store/useQuizConfig";
import type { QuizStore } from "@/types";
import { motion } from "framer-motion";
import { Sparkles, Brain, Trophy, Timer } from "lucide-react";

export default function Home() {
  const config = useQuizConfig((state: QuizStore) => state.config);
  const addQuestionNumber = useQuizConfig((state: QuizStore) => state.addQuestionNumber);

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center max-w-3xl w-full text-center space-y-8 relative z-10"
      >
        
        {/* Hero Section */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Challenge Your Mind
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
          >
            <span className="text-foreground">Trivia</span>{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Master
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base text-muted-foreground max-w-md mx-auto"
          >
            Test your knowledge across categories and difficulty levels.
          </motion.p>
        </div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 text-xs"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 rounded-full text-muted-foreground">
            <Brain className="w-3.5 h-3.5 text-primary" />
            Multiple Categories
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 rounded-full text-muted-foreground">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            Track Your Score
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 rounded-full text-muted-foreground">
            <Timer className="w-3.5 h-3.5 text-primary" />
            Timed Mode
          </div>
        </motion.div>

        {/* Configuration Card */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl rounded-2xl p-5 md:p-8 space-y-6"
        >
          {/* Settings Row */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <NumberStepper
              label="Questions"
              value={config.numberOfQuestion || 10}
              onChange={(value) => addQuestionNumber(value.toString())}
              min={5}
              max={50}
              step={1}
            />
            <TimedModeToggle />
          </div>

          {/* Dropdowns */}
          <DropdownOptions />
          
          {/* Start Button */}
          <Button />
        </motion.section>
      </motion.div>
    </main>
  );
}
