import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    /**
     * Atlas entries are validated rather than free-form: a malformed entry is a
     * build failure, not a silently broken page. `project` ties each entry back
     * to .github/projects.json, which check-manifest.mjs cross-validates.
     */
    atlas: defineCollection({
      type: 'page',
      source: 'atlas/**',
      schema: z.object({
        project: z.string(),
        track: z.enum([
          'clean-architecture',
          'solid',
          'edge-runtime',
          'microservices',
          'ai-rag',
          'tooling',
        ]),
        stack: z.array(z.string()),
        status: z.enum(['reference', 'in-progress', 'archived']),
        compare: z.array(z.string()).default([]),
      }),
    }),

    content: defineCollection({
      type: 'page',
      source: '**',
    }),
  },
})
