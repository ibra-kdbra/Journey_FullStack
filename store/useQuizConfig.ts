import { create } from "zustand";
import type { QuizConfig, QuizStore } from "@/types";

const defaultConfig: QuizConfig = {
  numberOfQuestion: 10,
  category: { id: 0, name: "" },
  level: "",
  type: "",
  status: "",
  score: 0,
  timedMode: false,
  timePerQuestion: 15,
};

export const useQuizConfig = create<QuizStore>((set) => ({
  config: { ...defaultConfig },
  
  addLevel: (level) =>
    set((state) => ({ 
      config: { ...state.config, level } 
    })),
    
  addCategory: (id, name) =>
    set((state) => ({
      config: { ...state.config, category: { id, name } },
    })),
    
  addType: (type) =>
    set((state) => ({ 
      config: { ...state.config, type } 
    })),
    
  addQuestionNumber: (numberOfQuestion) =>
    set((state) => ({
      config: { ...state.config, numberOfQuestion: parseInt(numberOfQuestion) || 10 },
    })),
    
  changeStatus: (status) =>
    set((state) => ({
      config: { ...state.config, status },
    })),
    
  setScore: () =>
    set((state) => ({
      config: { ...state.config, score: state.config.score + 1 },
    })),

  setTimedMode: (timedMode) =>
    set((state) => ({
      config: { ...state.config, timedMode },
    })),

  removeConfig: () => set({ config: { ...defaultConfig } }),
}));
