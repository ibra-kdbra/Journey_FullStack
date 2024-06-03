import bcrypt from 'bcrypt'
import config from '../helpers/EnvConfig'

const { salt, pepper } = config

const hashPassword = (password: string): string => {
    const hash = bcrypt.hashSync(password + pepper, parseInt(salt as string, 10))
    return hash
}

export { hashPassword }