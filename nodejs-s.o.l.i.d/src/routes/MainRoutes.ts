import { Router } from "express";
import { pay, sendNotification, transferMoney } from "../controllers/HomeController";

const MainRoutes = Router()

MainRoutes.post('/pay', pay)
MainRoutes.post('/notification/send', sendNotification)
MainRoutes.post('/transfer/:platform', transferMoney)

export default MainRoutes