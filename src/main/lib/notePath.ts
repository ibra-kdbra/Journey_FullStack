import path from 'path'

/**
 * Resolve a renderer-supplied note name to an absolute `<rootDir>/<name>.md` path.
 * Throws if the name is not a plain file name (separators, traversal, NUL bytes, ...).
 */
export const resolveNotePath = (rootDir: string, filename: unknown): string => {
  if (
    typeof filename !== 'string' ||
    filename.length === 0 ||
    filename.includes('\0') ||
    filename.includes('/') ||
    filename.includes('\\') ||
    filename === '.' ||
    filename === '..'
  ) {
    throw new Error('Invalid note filename')
  }

  const root = path.resolve(rootDir)
  const resolved = path.join(root, `${filename}.md`)

  if (path.dirname(resolved) !== root) {
    throw new Error('Invalid note filename')
  }

  return resolved
}
