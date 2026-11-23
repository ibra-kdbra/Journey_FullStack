import { Router } from 'express'
import { login } from '../controllers/AuthController'
import { ValidateBody } from '../middlewares'
import { LoginSchema } from '../middlewares/schemas'

const authRoutes = Router()

authRoutes.post('/login', ValidateBody(LoginSchema), login)

export default authRoutes
