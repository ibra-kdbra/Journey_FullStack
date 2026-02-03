"use client";

import { useQuizConfig } from "@/store/useQuizConfig";
import type { QuizStore } from "@/types";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Github } from "lucide-react";

export default function ClientLayout({
  children,
  quiz,
}: {
  children: React.ReactNode;
  quiz: React.ReactNode;
}) {
  const config = useQuizConfig((state: QuizStore) => state.config);
  const render = config.status ? quiz : children;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <a
        href="https://github.com/ibra-kdbra"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-card/80 backdrop-blur-sm border shadow-sm hover:bg-accent/50 hover:scale-110 transition-all duration-300 group"
        aria-label="View on GitHub"
      >
        <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
      </a>
      {render}
    </ThemeProvider>
  );
}
