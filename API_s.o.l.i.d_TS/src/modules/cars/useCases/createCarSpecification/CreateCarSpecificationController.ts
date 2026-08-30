import { Request, Response } from "express";
import { container } from "tsyringe";

import { AppError } from "../../../../shared/errors/AppError";
import { CreateCarSpecificationUseCase } from "./CreateCarSpecificationUseCase";

class CreateCarSpecificationController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        // Express 5 types params as string | string[] to allow wildcards; this
        // route declares a single ":id".
        if (typeof id !== "string") {
            throw new AppError("Invalid car id");
        }
        const { specificationId } = req.body;
        const createCarSpecificationUseCase = container.resolve(CreateCarSpecificationUseCase);
        const cars = await createCarSpecificationUseCase.execute({
            carId: id,
            specificationId,
        });
        return res.json(cars);
    }
}
export { CreateCarSpecificationController };
