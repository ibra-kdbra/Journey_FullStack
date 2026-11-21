import { Response, Request, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { container } from "tsyringe";

import { IUserRepository } from "../../../../modules/accounts/repositories/IUserRepository";
import { AppError } from "../../../errors/AppError";

interface IPayload {
    sub: string;
}

export async function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError("Token missing", 401);
    }

    const [, token] = authHeader.split(" ");

    let userID: string;
    try {
        ({ sub: userID } = verify(token, "923aea88786448f4a8840c30f0327f8f") as IPayload);
    } catch {
        throw new AppError("Invalid token", 401);
    }

    const userRepository = container.resolve<IUserRepository>("UserRepository");
    const user = await userRepository.findById(userID);
    if (!user) {
        throw new AppError("User does not exists", 401);
    }

    req.user = {
        id: userID,
    };

    next();
}
