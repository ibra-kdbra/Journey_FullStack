import type { INewsletterRepository } from '../domain/ports/newsletter-repository-interface'
import { createInMemoryRepository } from './in-memory-newsletter-repository'
import { createSupabaseNewsletterRepository } from './supabase-newsletter-repository'

export type RepositoryKind = 'in-memory' | 'supabase'

export interface RepositoryEnvironment {
  /** NODE_ENV */
  nodeEnv?: string
  /** True under vitest. */
  isTest?: boolean
  /** public.supabase.url / public.supabase.key from @nuxtjs/supabase's runtime config. */
  supabaseUrl?: string
  supabaseKey?: string
}

// Pure so it can be tested without a Nuxt context. Supabase is used only in a
// real (non-dev, non-test) run that actually has credentials; anything else gets
// the in-memory repository instead of a client that cannot connect.
export const selectRepositoryKind = (env: RepositoryEnvironment): RepositoryKind => {
  if (env.nodeEnv === 'development' || env.isTest) return 'in-memory'
  return env.supabaseUrl && env.supabaseKey ? 'supabase' : 'in-memory'
}

export const createNewsletterRepository = (): INewsletterRepository => {
  const isTest = Boolean(process.env.VITEST)
  const nodeEnv = process.env.NODE_ENV
  // useRuntimeConfig is only touched on the production path: it needs a Nuxt
  // context, which unit tests do not have.
  const supabase = nodeEnv === 'development' || isTest
    ? undefined
    : useRuntimeConfig().public.supabase as { url?: string, key?: string } | undefined

  const kind = selectRepositoryKind({
    nodeEnv,
    isTest,
    supabaseUrl: supabase?.url,
    supabaseKey: supabase?.key,
  })

  if (kind === 'supabase') return createSupabaseNewsletterRepository()

  if (nodeEnv !== 'development' && !isTest) {
    console.warn(
      '[newsletter] SUPABASE_URL / SUPABASE_KEY are not set; using the in-memory repository. Subscriptions will not persist.',
    )
  }
  return createInMemoryRepository()
}
