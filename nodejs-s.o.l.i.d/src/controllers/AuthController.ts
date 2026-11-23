import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import config from '../helpers/EnvConfig'
import { User } from '../models/User'
import { signToken } from '../services/TokenService'

// Compared against when the email is unknown so the response time does not
// reveal whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 4)

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        // The default scope hides the hash; login is the one place that needs it.
        const user = await User.unscoped().findOne({ where: { email } })
        const valid = await bcrypt.compare(
            password + config.pepper,
            user ? user.password : DUMMY_HASH,
        )
        if (!user || !valid) {
            return res.status(401).json({ status: 'error', message: 'Invalid email or password' })
        }
        res.json({ token: signToken(user.id) })
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
}
