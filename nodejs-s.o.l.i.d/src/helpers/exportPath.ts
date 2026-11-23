import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'

/**
 * Exports contain user data, so they are written under `exports/` (never served
 * statically) with an unguessable name and removed once the response is sent.
 */
export async function newExportPath(extension: string): Promise<string> {
    const dir = path.join(process.cwd(), 'exports')
    await fs.promises.mkdir(dir, { recursive: true })
    return path.join(dir, `${randomUUID()}.${extension}`)
}
