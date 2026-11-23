import { Router } from 'express'
import { all, find, update, exportFile, userOrders } from '../controllers/UserController';
import { ValidateBody, ValidateParams, authenticate, requireAdmin, requireSelfOrAdmin } from '../middlewares';
import { UserUpdateSchema, ExportTypeSchema } from "../middlewares/schemas"

const userRoutes = Router()

// Every user route requires a valid token.
userRoutes.use(authenticate)

userRoutes.get('/', requireAdmin, all)
userRoutes.get('/export/:type', requireAdmin, ValidateParams(ExportTypeSchema), exportFile)
userRoutes.get('/orders/:userId', requireSelfOrAdmin('userId'), userOrders)
userRoutes.get('/:id', requireSelfOrAdmin('id'), find)
userRoutes.put('/:id', requireSelfOrAdmin('id'), ValidateBody(UserUpdateSchema), update)

export default userRoutes;
