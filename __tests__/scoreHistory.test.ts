import { describe, it, expect, beforeEach } from 'vitest'
import { saveScore, getScoreHistory, clearScoreHistory, getBestScore } from '@/lib/scoreHistory'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Score History', () => {
  beforeEach(() => {
    clearScoreHistory()
  })

  it('should start with empty history', () => {
    const history = getScoreHistory()
    expect(history).toEqual([])
  })

  it('should save a score correctly', () => {
    saveScore({
      score: 8,
      total: 10,
      percentage: 80,
      category: 'General Knowledge',
      difficulty: 'medium',
      timedMode: false,
    })

    const history = getScoreHistory()
    expect(history.length).toBe(1)
    expect(history[0].score).toBe(8)
    expect(history[0].total).toBe(10)
    expect(history[0].percentage).toBe(80)
  })

  it('should get best score correctly', () => {
    saveScore({
      score: 5,
      total: 10,
      percentage: 50,
      category: 'Science',
      difficulty: 'easy',
      timedMode: false,
    })
    
    saveScore({
      score: 9,
      total: 10,
      percentage: 90,
      category: 'General Knowledge',
      difficulty: 'hard',
      timedMode: true,
    })
    
    saveScore({
      score: 7,
      total: 10,
      percentage: 70,
      category: 'History',
      difficulty: 'medium',
      timedMode: false,
    })

    const best = getBestScore()
    expect(best).not.toBeNull()
    expect(best?.percentage).toBe(90)
    expect(best?.category).toBe('General Knowledge')
  })

  it('should keep only last 10 scores', () => {
    for (let i = 0; i < 15; i++) {
      saveScore({
        score: i,
        total: 10,
        percentage: i * 10,
        category: 'Test',
        difficulty: 'easy',
        timedMode: false,
      })
    }

    const history = getScoreHistory()
    expect(history.length).toBe(10)
    // Most recent should be first
    expect(history[0].score).toBe(14)
  })

  it('should clear history correctly', () => {
    saveScore({
      score: 10,
      total: 10,
      percentage: 100,
      category: 'Test',
      difficulty: 'hard',
      timedMode: true,
    })

    expect(getScoreHistory().length).toBe(1)
    
    clearScoreHistory()
    
    expect(getScoreHistory()).toEqual([])
  })
})
