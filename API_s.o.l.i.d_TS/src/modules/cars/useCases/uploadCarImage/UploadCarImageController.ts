import { Request, Response } from "express";
import { container } from "tsyringe";

import { AppError } from "../../../../shared/errors/AppError";
import { UploadCarImageUseCase } from "./UploadCarImageUseCase";

interface IFiles {
    filename: string;
}

class UploadCarImageController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        // Express 5 types params as string | string[] to allow wildcards; this
        // route declares a single ":id".
        if (typeof id !== "string") {
            throw new AppError("Invalid car id");
        }
        const images = req.files as IFiles[];

        const imagesName = images.map((file) => file.filename);

        const uploadCarImageUseCase = container.resolve(UploadCarImageUseCase);

        await uploadCarImageUseCase.execute({ cardId: id, imagesName });

        return res.status(201).send();
    }
}

export { UploadCarImageController };
