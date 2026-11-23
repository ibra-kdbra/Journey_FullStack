import * as dotenv from 'dotenv'

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

const envFound = dotenv.config()
if (envFound.error && !isTest) {
    // This error should crash whole process
    throw new Error("Couldn't find .env file")
}

// Clearly fake value, only ever used outside production so local development
// works without extra setup. Never reaches a production process.
const DEV_JWT_SECRET = 'dev-only-insecure-jwt-secret-change-me'

const jwtSecret = process.env.JWT_SECRET || (isProduction ? undefined : DEV_JWT_SECRET)
if (!jwtSecret) {
    // Fail fast: tokens signed with a missing/known secret would be forgeable.
    throw new Error('JWT_SECRET must be set when NODE_ENV=production')
}

export default {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    host: process.env.DATABASE_HOST,
    salt: process.env.SALT_ROUNDS,
    pepper: process.env.BCRYPT_PASSWORD,
    email_user: process.env.EMAIL_USER,
    email_password: process.env.EMAIL_PASSWORD,
    email_provider: process.env.EMAIL_PROVIDER,
    email_from: process.env.EMAIL_FROM,
    jwt_secret: jwtSecret,
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '1h',
    // Comma separated user ids allowed to list/export all users and edit anyone.
    admin_user_ids: (process.env.ADMIN_USER_IDS || '')
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0),
}
