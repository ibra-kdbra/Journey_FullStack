"use client";
import React from "react";
import { useQuizConfig } from "@/store/useQuizConfig";
import type { QuizStore } from "@/types";
import { getCachedCategories } from "@/lib/api";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const levels = ["easy", "medium", "hard"] as const;
const types = ["multiple", "boolean"] as const;

export default function Button() {
  const config = useQuizConfig((state: QuizStore) => state.config);
  const addCategory = useQuizConfig((state: QuizStore) => state.addCategory);
  const addLevel = useQuizConfig((state: QuizStore) => state.addLevel);
  const addType = useQuizConfig((state: QuizStore) => state.addType);
  const changeStatus = useQuizConfig((state: QuizStore) => state.changeStatus);

  const handleStart = () => {
    // If no category selected, pick a random one from cache
    if (!config.category.id || config.category.id === 0) {
      const cachedCategories = getCachedCategories();
      if (cachedCategories.length > 0) {
        const randomCat = cachedCategories[Math.floor(Math.random() * cachedCategories.length)];
        addCategory(randomCat.id, randomCat.name);
      }
    }

    // If no level selected, pick a random one
    if (!config.level) {
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      addLevel(randomLevel);
    }

    // If no type selected, pick a random one
    if (!config.type) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      addType(randomType);
    }

    // Start the quiz
    changeStatus("start");
  };

  return (
    <motion.button
      onClick={handleStart}
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex items-center justify-center gap-3 mx-auto text-lg font-semibold 
        bg-primary text-primary-foreground 
        rounded-xl py-4 px-10 w-full md:w-auto md:min-w-[280px]
        shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
    >
      <Play className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
      Start Quiz Now
    </motion.button>
  );
}
