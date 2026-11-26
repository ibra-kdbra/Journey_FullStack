import { db } from "@/db"
import { j } from "./__internals/j"
import { currentUser } from "@clerk/nextjs/server"
import { HTTPException } from "hono/http-exception"

const authMiddleware = j.middleware(async ({ c, next }) => {
    // Dashboard procedures authenticate with the Clerk session only. The
    // event-ingest API key is accepted solely by /api/v1/events.
    const auth = await currentUser()

    if (!auth) {
        throw new HTTPException(401, { message: "Unauthorized" })
    }

    const user = await db.user.findUnique({
        where: { externalId: auth.id },
    })

    if (!user) {
        throw new HTTPException(401, { message: "Unauthorized" })
    }

    return next({ user })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const baseProcedure = j.procedure
export const publicProcedure = baseProcedure
export const privateProcedure = publicProcedure.use(authMiddleware)