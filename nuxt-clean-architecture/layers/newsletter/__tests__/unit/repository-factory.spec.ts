import { describe, expect, it } from 'vitest'
import { selectRepositoryKind } from '../../repositories/newsletter-repository-factory'

const creds = { supabaseUrl: 'https://x.supabase.co', supabaseKey: 'anon' }

describe('selectRepositoryKind', () => {
  it('uses Supabase in production when credentials are configured', () => {
    expect(selectRepositoryKind({ nodeEnv: 'production', ...creds })).toBe('supabase')
  })

  it('falls back to in-memory in production without credentials', () => {
    expect(selectRepositoryKind({ nodeEnv: 'production' })).toBe('in-memory')
    expect(selectRepositoryKind({ nodeEnv: 'production', supabaseUrl: 'https://x.supabase.co' })).toBe('in-memory')
  })

  it('always uses in-memory in development and tests', () => {
    expect(selectRepositoryKind({ nodeEnv: 'development', ...creds })).toBe('in-memory')
    expect(selectRepositoryKind({ nodeEnv: 'production', isTest: true, ...creds })).toBe('in-memory')
  })
})
