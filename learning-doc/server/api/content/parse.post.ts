import { parseContent } from '#content/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.content) {
    throw createError({ statusCode: 400, statusMessage: 'Missing content' })
  }
  
  // Use Nuxt Content's internal parser
  const parsed = await parseContent('virtual.md', body.content)
  return parsed
})
