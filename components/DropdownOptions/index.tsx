"use client";
import { ConfigSelect } from "@/components/ui/config-select";
import { useQuizConfig } from "@/store/useQuizConfig";
import type { QuizStore, Category } from "@/types";
import { fetchCategories, getCachedCategories } from "@/lib/api";
import { useEffect, useState } from "react";

export default function DropdownOptions() {
  const [categories, setCategories] = useState<Category[]>([]);

  const config = useQuizConfig((state: QuizStore) => state.config);
  const addCategory = useQuizConfig((state: QuizStore) => state.addCategory);
  const addLevel = useQuizConfig((state: QuizStore) => state.addLevel);
  const addType = useQuizConfig((state: QuizStore) => state.addType);

  useEffect(() => {
    async function loadCategories() {
      // Check cache first
      const cached = getCachedCategories();
      if (cached.length > 0) {
        setCategories(cached);
        return;
      }
      
      try {
        const { trivia_categories } = await fetchCategories();
        setCategories(trivia_categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    loadCategories();
  }, []);

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const levelOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const typeOptions = [
    { value: "multiple", label: "Multiple Choice" },
    { value: "boolean", label: "True / False" },
  ];

  const getLevelLabel = (level: string) => {
    if (level === "easy") return "Easy";
    if (level === "medium") return "Medium";
    if (level === "hard") return "Hard";
    return "";
  };

  const getTypeLabel = (type: string) => {
    if (type === "boolean") return "True / False";
    if (type === "multiple") return "Multiple Choice";
    return "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <ConfigSelect
        label="Category"
        value={config.category.name || ""}
        options={categoryOptions}
        onSelect={(value, label) => addCategory(value as number, label || "")}
        placeholder="Select Category"
      />

      <ConfigSelect
        label="Difficulty"
        value={getLevelLabel(config.level)}
        options={levelOptions}
        onSelect={(value) => addLevel(value as "easy" | "medium" | "hard")}
        placeholder="Select Level"
      />

      <ConfigSelect
        label="Question Type"
        value={getTypeLabel(config.type)}
        options={typeOptions}
        onSelect={(value) => addType(value as "multiple" | "boolean")}
        placeholder="Select Type"
      />
    </div>
  );
}
