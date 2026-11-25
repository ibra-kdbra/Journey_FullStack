import { User } from "../models/User"
import { Request, Response } from 'express'
import { ExcelExporter, PdfExporter } from "../classes"
import { exportData, sendEmail } from '../services'
import Order from "../models/Order"
import fs from "fs"

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
        const user = await User.findByPk(Number(req.params.id))
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

        // Notify the user whose profile changed, at their own (post-update) address.
        const user = await User.findByPk(Number(req.params.id))
        if (user?.email) {
            await sendEmail(user.email, 'Profile Updated', 'Your profile has been updated.')
        }
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
        const filePath = await exportData(exporter, users)
        // Stream the file to the (already authorised) caller, then delete it.
        res.download(filePath, `users.${exporter.extension}`, () => {
            fs.promises.unlink(filePath).catch(() => undefined)
        })
    } catch (error) {
        console.error(error); res.status(500).json({ status: 'error', message: 'Internal server error' })
    }
}

// Task #6 get User Orders
export const userOrders = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(Number(req.params.userId), {
            include: Order,
        });

        res.json(user?.Orders)
    } catch (error) {
        return res.status(500).json(error)
    }
}





