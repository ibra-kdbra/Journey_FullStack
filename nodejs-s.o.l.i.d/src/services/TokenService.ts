import jwt from 'jsonwebtoken'
import config from '../helpers/EnvConfig'

export interface AuthPayload {
    id: number
    isAdmin: boolean
}

export const isAdminId = (id: number): boolean => config.admin_user_ids.includes(id)

export const signToken = (userId: number): string =>
    jwt.sign({ sub: String(userId) }, config.jwt_secret as string, {
        algorithm: 'HS256',
        expiresIn: config.jwt_expires_in as jwt.SignOptions['expiresIn'],
    })

/** Returns the authenticated identity, or null for any invalid/expired token. */
export const verifyToken = (token: string): AuthPayload | null => {
    try {
        const decoded = jwt.verify(token, config.jwt_secret as string, {
            algorithms: ['HS256'],
        })
        const id = Number(typeof decoded === 'object' ? decoded.sub : NaN)
        if (!Number.isInteger(id) || id <= 0) return null
        // Admin status comes from server config at request time, not from the token.
        return { id, isAdmin: isAdminId(id) }
    } catch {
        return null
    }
}
