import { Request, Response } from "express"
import Order from "../models/Order"


// Task 6 get Orders List
// Errors go to the global errorHandler (Express 5 forwards rejected promises).
export const all = async (req: Request, res: Response) => {
    const orders = await Order.findAll()
    res.json(orders)
}
