import { Router } from 'express'
import { all, find, update, exportFile, userOrders } from '../controllers/UserController';
import { ValidateBody, ValidateParams, authenticate, requireAdmin, requireSelfOrAdmin } from '../middlewares';
import { UserUpdateSchema, ExportTypeSchema, IdParamSchema, UserIdParamSchema } from "../middlewares/schemas"

const userRoutes = Router()

// Every user route requires a valid token.
userRoutes.use(authenticate)

userRoutes.get('/', requireAdmin, all)
userRoutes.get('/export/:type', requireAdmin, ValidateParams(ExportTypeSchema), exportFile)
userRoutes.get('/orders/:userId', ValidateParams(UserIdParamSchema), requireSelfOrAdmin('userId'), userOrders)
userRoutes.get('/:id', ValidateParams(IdParamSchema), requireSelfOrAdmin('id'), find)
userRoutes.put('/:id', ValidateParams(IdParamSchema), requireSelfOrAdmin('id'), ValidateBody(UserUpdateSchema), update)

export default userRoutes;
