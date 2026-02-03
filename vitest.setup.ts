import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock AudioContext for sound effects
class MockAudioContext {
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { setValueAtTime: () => {} },
      type: 'sine',
    }
  }
  createGain() {
    return {
      connect: () => {},
      gain: { value: 0 },
    }
  }
  close() {}
  get currentTime() {
    return 0
  }
  get destination() {
    return {}
  }
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
})

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))
