import { User } from "../models/User"
import { Request, Response } from 'express'
import { ExcelExporter, PdfExporter } from "../classes"
import { exportData, sendEmail } from '../services'
import Order from "../models/Order"
import fs from "fs"

// Errors are not caught here: Express 5 forwards rejected promises to the
// global errorHandler, which returns a generic message and logs the detail.
export const all = async (req: Request, res: Response) => {
    const users = await User.findAll()
    res.json(users)
}

export const find = async (req: Request, res: Response) => {
    const user = await User.findByPk(Number(req.params.id))
    res.json(user)
}

//Task #1 Single Responsibility
export const update = async (req: Request, res: Response) => {
    const updated = await User.update(req.body, {
        where: {
            id: Number(req.params.id),
        },
        individualHooks: true,
    })

    // Notify the user whose profile changed, at their own (post-update) address.
    const user = await User.findByPk(Number(req.params.id))
    if (user?.email) {
        await sendEmail(user.email, 'Profile Updated', 'Your profile has been updated.')
    }
    res.json({ updated })
}

//Task #2 Open/Closed
export const exportFile = async (req: Request, res: Response) => {
    const exporter = req.params.type === 'excel' ? new ExcelExporter() : new PdfExporter();
    const users = await User.findAll()
    const filePath = await exportData(exporter, users)
    // Stream the file to the (already authorised) caller, then delete it.
    res.download(filePath, `users.${exporter.extension}`, () => {
        fs.promises.unlink(filePath).catch(() => undefined)
    })
}

// Task #6 get User Orders
export const userOrders = async (req: Request, res: Response) => {
    const user = await User.findByPk(Number(req.params.userId), {
        include: Order,
    });

    res.json(user?.Orders)
}
