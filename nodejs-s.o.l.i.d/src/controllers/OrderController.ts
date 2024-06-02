import { Request, Response } from "express"
import Order from "../models/Order"


// Task 6 get Orders List
export const all = async (req: Request, res: Response) => {
    try {
        const orders = await Order.findAll()
        res.json(orders)
    } catch (error) {
        return res.status(500).json(error)
    }
}

