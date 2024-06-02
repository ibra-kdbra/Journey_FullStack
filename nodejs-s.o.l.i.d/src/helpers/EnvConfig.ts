import * as dotenv from 'dotenv'

const envFound = dotenv.config()
if (envFound.error) {
    // This error should crash whole process
    throw new Error("Couldn't find .env file")
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
}
