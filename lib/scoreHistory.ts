// Score history stored in localStorage
export interface ScoreRecord {
  date: string;
  score: number;
  total: number;
  percentage: number;
  category: string;
  difficulty: string;
  timedMode: boolean;
}

const STORAGE_KEY = "quiz_score_history";
const MAX_HISTORY = 10;

export function saveScore(record: Omit<ScoreRecord, "date">): void {
  if (typeof window === "undefined") return;
  
  const history = getScoreHistory();
  const newRecord: ScoreRecord = {
    ...record,
    date: new Date().toISOString(),
  };
  
  // Add new record at the beginning, keep only last MAX_HISTORY
  const updated = [newRecord, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getScoreHistory(): ScoreRecord[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearScoreHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getBestScore(): ScoreRecord | null {
  const history = getScoreHistory();
  if (history.length === 0) return null;
  
  return history.reduce((best, current) => 
    current.percentage > best.percentage ? current : best
  );
}
