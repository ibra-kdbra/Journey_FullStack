import { NextFunction, Request, Response } from 'express'
import { AuthPayload, verifyToken } from '../services/TokenService'

declare global {
    namespace Express {
        interface Request {
            auth?: AuthPayload
        }
    }
}

/** Rejects requests without a valid `Authorization: Bearer <jwt>` header (401). */
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization
    const match = header ? /^Bearer (.+)$/.exec(header) : null
    const auth = match ? verifyToken(match[1]) : null
    if (!auth) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    req.auth = auth
    next()
}

/** Must run after `authenticate`. Only admins pass (403 otherwise). */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.auth?.isAdmin) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' })
    }
    next()
}

/** Must run after `authenticate`. The owner of the resource or an admin passes. */
export function requireSelfOrAdmin(param: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const target = Number(req.params[param])
        if (!req.auth || !(req.auth.isAdmin || req.auth.id === target)) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' })
        }
        next()
    }
}
