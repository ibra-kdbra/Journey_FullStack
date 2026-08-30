import { NextFunction, Request, Response } from "express";

import { UserRepository } from "../../../../modules/accounts/infra/typeorm/repositories/UserRepository";
import { AppError } from "../../../errors/AppError";

export async function ensureAdmin(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user;
    const userRepository = new UserRepository();
    const user = await userRepository.findById(id);
    // A token can outlive the user it names. Reading .isAdmin off null threw a
    // raw TypeError, which the error handler turned into a 500.
    if (!user) {
        throw new AppError("User not found", 401);
    }
    if (!user.isAdmin) {
        throw new AppError("User is not a admin");
    }
    return next();
}
