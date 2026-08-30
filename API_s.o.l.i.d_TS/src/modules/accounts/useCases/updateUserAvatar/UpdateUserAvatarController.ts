import { Request, Response } from "express";
import { container } from "tsyringe";

import { AppError } from "../../../../shared/errors/AppError";
import { UpdateUserAvatarUseCase } from "./UpdateUserAvatarUseCase";

class UpdateUserAvatarController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.user;

        // multer leaves req.file undefined when the request carries no file.
        if (!req.file) {
            throw new AppError("Avatar file is required");
        }
        const avatarFile = req.file.filename;
        const updateUserAvatarUseCase = container.resolve(UpdateUserAvatarUseCase);

        await updateUserAvatarUseCase.execute({ userID: id, avatarFile });

        return res.status(204).send();
    }
}

export { UpdateUserAvatarController };
