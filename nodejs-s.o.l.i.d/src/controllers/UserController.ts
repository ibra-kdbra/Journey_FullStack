import { User } from "../models/User"
import { Request, Response } from 'express'
import { ExcelExporter, PdfExporter } from "../classes"
import { exportData, sendEmail } from '../services'
import Order from "../models/Order"

export const all = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll()
        res.json(users)
    } catch (error) {
        return res.status(500).json(error)
    }
}

export const find = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id)
        res.json(user)
    } catch (error) {
        res.status(500).json(error)
    }
}

//Task #1 Single Responsibility
export const update = async (req: Request, res: Response) => {
    try {
        const updated = await User.update(req.body, {
            where: {
                id: req.params.id,
            },
            individualHooks: true,
        })

        sendEmail('dev.melshafaey@gmail.com', 'Profile Updated', 'Profile Updated'); 
        res.json({ updated })
    } catch (error) {
        res.status(500).json(error)
    }
}

//Task #2 Open/Closed
export const exportFile = async (req: Request, res: Response) => {
    try {
        const exporter = req.params.type === 'excel' ? new ExcelExporter() : new PdfExporter();
        const users = await User.findAll()
        await exportData(exporter, users)
        res.json({ "success": true, message: `File exported to path` })
    } catch (error) {
        console.log(error); res.status(500).json(error)
    }
}

// Task #6 get User Orders
export const userOrders = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.userId, {
            include: Order,
        });

        res.json(user?.Orders)
    } catch (error) {
        return res.status(500).json(error)
    }
}





