"use client";

import { cn, decodeHtmlEntities } from "@/lib/utils";
import { playSound } from "@/lib/sounds";
import { saveScore, getBestScore, type ScoreRecord } from "@/lib/scoreHistory";
import { fetchQuestions, RateLimitError, NoResultsError } from "@/lib/api";
import { useQuizConfig } from "@/store/useQuizConfig";
import type { QuizStore, Question } from "@/types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, CheckCircle2, XCircle, ArrowRight, Timer, Star, AlertCircle, RefreshCw } from "lucide-react";
import { Confetti } from "@/components/Confetti";

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answer, setAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showResults, setShowResults] = useState(false);
  const [bestScore, setBestScore] = useState<ScoreRecord | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const config = useQuizConfig((state: QuizStore) => state.config);
  const setScore = useQuizConfig((state: QuizStore) => state.setScore);

  // Fetch questions using API layer
  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchQuestions({
        amount: config.numberOfQuestion,
        category: config.category.id,
        difficulty: config.level || undefined,
        type: config.type || undefined,
      });
      
      if (data.results && data.results.length > 0) {
        const shuffled = data.results.map((e: Question) => {
          const allAnswers = [...e.incorrect_answers, e.correct_answer];
          e.answers = allAnswers.sort(() => Math.random() - 0.5);
          return e;
        });
        setQuestions(shuffled);
      } else {
        setError("No questions available for this selection.");
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError("Too many requests. Please wait 5 seconds and try again.");
      } else if (err instanceof NoResultsError) {
        setError("No questions available for this category/difficulty. Try different options.");
      } else {
        setError("Failed to load questions. Please check your connection.");
      }
      console.error("Failed to fetch questions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, [config.category.id, config.level, config.numberOfQuestion, config.type]);

  // Timer logic
  useEffect(() => {
    if (!config.timedMode || loading || questions.length === 0 || answer) return;

    setTimeLeft(config.timePerQuestion);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (questions.length > 0) {
            playSound("timeout");
            setAnswer(questions[0].correct_answer);
            setSelectedAnswer("__timeout__");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.timedMode, config.timePerQuestion, loading, questions, answer]);

  // Trigger confetti and save score on quiz completion
  useEffect(() => {
    if (showResults && !scoreSaved) {
      const total = config.numberOfQuestion || 10;
      const pct = Math.round((config.score / total) * 100);
      
      // Save score to history
      saveScore({
        score: config.score,
        total,
        percentage: pct,
        category: config.category.name || "Random",
        difficulty: config.level || "Any",
        timedMode: config.timedMode,
      });
      setScoreSaved(true);
      setBestScore(getBestScore());
      
      if (pct >= 50) {
        setShowConfetti(true);
      }
    }
  }, [showResults, config.score, config.numberOfQuestion, config.category.name, config.level, config.timedMode, scoreSaved]);

  const answerCheck = (ans: string) => {
    setSelectedAnswer(ans);
    const isCorrect = ans === questions[0].correct_answer;
    
    if (isCorrect) {
      setScore();
      playSound("correct");
    } else {
      playSound("wrong");
    }
    setAnswer(questions[0].correct_answer);
  };

  const handleNext = () => {
    if (questions.length === 1) {
      // Last question - show results
      setQuestions([]);
      setShowResults(true);
    } else {
      setQuestions(questions.slice(1));
    }
    setAnswer("");
    setSelectedAnswer("");
    setTimeLeft(config.timePerQuestion);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-lg max-w-md w-full text-center space-y-6"
        >
          <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Oops!</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={loadQuestions}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
            >
              <RefreshCw className="w-5 h-5" /> Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    const total = config.numberOfQuestion || 10;
    const pct = Math.round((config.score / total) * 100);
    const isGreat = pct >= 70;
    const isGood = pct >= 50;
    
    return (
      <div className="flex justify-center items-center min-h-screen bg-background p-4">
        <Confetti trigger={showConfetti} />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-lg max-w-md w-full text-center space-y-6"
        >
          <Trophy className={cn("w-16 h-16 mx-auto", isGreat ? "text-primary" : isGood ? "text-amber-500" : "text-muted-foreground")} />
          <div>
            <h2 className="text-xl font-bold text-muted-foreground">Quiz Completed!</h2>
            <h1 className="text-5xl font-black mt-2 text-foreground">
              {config.score}<span className="text-xl text-muted-foreground">/{total}</span>
            </h1>
            <p className={cn("mt-1 font-medium", isGreat ? "text-primary" : isGood ? "text-amber-500" : "text-muted-foreground")}>
              {pct}% correct
            </p>
            <p className="text-muted-foreground mt-2">
              {isGreat ? "🎉 Excellent work!" : isGood ? "👍 Good job!" : "💪 Keep practicing!"}
            </p>
            {bestScore && bestScore.percentage === pct && config.score === bestScore.score && (
              <p className="text-primary font-bold flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 fill-current" /> New Personal Best!
              </p>
            )}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            <RotateCcw className="w-5 h-5" /> Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  const total = config.numberOfQuestion || 10;
  const current = total - questions.length + 1;
  const timerPercentage = (timeLeft / config.timePerQuestion) * 100;
  const isTimerLow = timeLeft <= 5;
  
  return (
    <section className="flex justify-center items-center min-h-screen bg-background p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Progress */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="h-full bg-primary rounded-full transition-all" 
            style={{ width: `${((current-1)/total)*100}%` }} 
          />
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="bg-card px-4 py-2 rounded-full border border-border">
            Question <span className="text-primary font-bold">{current}</span> of {total}
          </span>
          
          {config.timedMode && (
            <span className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors",
              isTimerLow && !answer
                ? "bg-destructive/10 border-destructive text-destructive animate-pulse"
                : "bg-card border-border"
            )}>
              <Timer className="w-4 h-4" />
              <span className="font-bold tabular-nums">{timeLeft}s</span>
            </span>
          )}
          
          <span className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> 
            <span className="font-bold">{config.score}</span>
          </span>
        </div>

        {config.timedMode && !answer && (
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isTimerLow ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${timerPercentage}%` }} 
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div 
            key={questions[0].question} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} 
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg space-y-6"
          >
            <div>
              <span className="text-xs text-primary uppercase tracking-widest font-medium">
                {questions[0].category}
              </span>
              <h4 className="text-lg md:text-xl font-bold mt-2 text-foreground">
                {decodeHtmlEntities(questions[0].question)}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions[0].answers?.map((e) => {
                const isAnswered = !!answer;
                const isCorrect = e === questions[0].correct_answer;
                const wasSelected = e === selectedAnswer;
                const timedOut = selectedAnswer === "__timeout__";
                
                let style = "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-transparent";
                let icon = null;
                
                if (isAnswered) {
                  if (isCorrect) {
                    style = "bg-primary/10 border-primary text-primary";
                    icon = <CheckCircle2 className="w-5 h-5 shrink-0" />;
                  } else if (wasSelected && !timedOut) {
                    style = "bg-destructive/10 border-destructive text-destructive";
                    icon = <XCircle className="w-5 h-5 shrink-0" />;
                  } else {
                    style = "bg-muted/50 text-muted-foreground opacity-50 border-transparent";
                  }
                }

                return (
                  <button 
                    key={e} 
                    disabled={isAnswered} 
                    onClick={() => answerCheck(e)}
                    className={cn(
                      "flex justify-between items-center p-4 rounded-xl font-medium text-left border-2 transition-all",
                      style
                    )}
                  >
                    <span>{decodeHtmlEntities(e)}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {selectedAnswer === "__timeout__" && (
              <p className="text-center text-destructive font-medium">
                ⏰ Time&apos;s up!
              </p>
            )}

            <div className="flex justify-center pt-2">
              <button 
                onClick={handleNext} 
                disabled={!answer}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                  answer 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                )}
              >
                {questions.length === 1 ? "See Results" : "Next"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
