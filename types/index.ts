// API Response Types
export interface Question {
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  // Added during processing
  answers?: string[];
}

export interface TriviaAPIResponse {
  response_code: number;
  results: Question[];
}

export interface Category {
  id: number;
  name: string;
}

export interface CategoryAPIResponse {
  trivia_categories: Category[];
}

// Store Types
export interface QuizConfig {
  numberOfQuestion: number;
  category: Category;
  level: "" | "easy" | "medium" | "hard";
  type: "" | "multiple" | "boolean";
  status: "" | "start" | "end";
  score: number;
  timedMode: boolean;
  timePerQuestion: number; // seconds
}

export interface QuizStore {
  config: QuizConfig;
  addLevel: (level: QuizConfig["level"]) => void;
  addCategory: (id: number, name: string) => void;
  addType: (type: QuizConfig["type"]) => void;
  addQuestionNumber: (num: string) => void;
  changeStatus: (status: QuizConfig["status"]) => void;
  setScore: () => void;
  setTimedMode: (enabled: boolean) => void;
  removeConfig: () => void;
}

// Component Props Types
export interface ConfigSelectOption {
  value: string | number;
  label: string;
}

export interface ConfigSelectProps {
  label: string;
  value: string;
  options: ConfigSelectOption[];
  onSelect: (value: string | number, label?: string) => void;
  placeholder?: string;
  className?: string;
}
