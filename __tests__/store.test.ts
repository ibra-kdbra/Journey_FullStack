import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuizConfig } from '@/store/useQuizConfig'

describe('useQuizConfig Store', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    const { result } = renderHook(() => useQuizConfig())
    act(() => {
      result.current.removeConfig()
    })
  })

  it('should have correct default values', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    expect(result.current.config.numberOfQuestion).toBe(10)
    expect(result.current.config.score).toBe(0)
    expect(result.current.config.status).toBe('')
    expect(result.current.config.timedMode).toBe(false)
    expect(result.current.config.timePerQuestion).toBe(15)
  })

  it('should add category correctly', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    act(() => {
      result.current.addCategory(9, 'General Knowledge')
    })
    
    expect(result.current.config.category.id).toBe(9)
    expect(result.current.config.category.name).toBe('General Knowledge')
  })

  it('should add level correctly', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    act(() => {
      result.current.addLevel('hard')
    })
    
    expect(result.current.config.level).toBe('hard')
  })

  it('should add type correctly', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    act(() => {
      result.current.addType('multiple')
    })
    
    expect(result.current.config.type).toBe('multiple')
  })

  it('should increment score correctly', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    expect(result.current.config.score).toBe(0)
    
    act(() => {
      result.current.setScore()
    })
    
    expect(result.current.config.score).toBe(1)
    
    act(() => {
      result.current.setScore()
      result.current.setScore()
    })
    
    expect(result.current.config.score).toBe(3)
  })

  it('should change status correctly', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    act(() => {
      result.current.changeStatus('start')
    })
    
    expect(result.current.config.status).toBe('start')
  })

  it('should toggle timed mode correctly', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    expect(result.current.config.timedMode).toBe(false)
    
    act(() => {
      result.current.setTimedMode(true)
    })
    
    expect(result.current.config.timedMode).toBe(true)
  })

  it('should reset config correctly', () => {
    const { result } = renderHook(() => useQuizConfig())
    
    // Modify some values
    act(() => {
      result.current.addCategory(15, 'Science')
      result.current.addLevel('hard')
      result.current.setScore()
      result.current.setTimedMode(true)
    })
    
    // Reset
    act(() => {
      result.current.removeConfig()
    })
    
    expect(result.current.config.category.id).toBe(0)
    expect(result.current.config.level).toBe('')
    expect(result.current.config.score).toBe(0)
    expect(result.current.config.timedMode).toBe(false)
  })
})
