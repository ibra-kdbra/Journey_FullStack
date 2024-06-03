import { Router } from 'express'
import { all, find, update, exportFile, userOrders } from '../controllers/UserController';
import { ValidateBody, ValidateParams } from '../middlewares';
import { UserUpdateSchema, ExportTypeSchema } from "../middlewares/schemas"

const userRoutes = Router()

userRoutes.get('/', all)
userRoutes.get('/export/:type', ValidateParams(ExportTypeSchema), exportFile)
userRoutes.get('/:id', find)
userRoutes.put('/:id', ValidateBody(UserUpdateSchema), update)
userRoutes.get('/orders/:userId', userOrders)


export default userRoutes;