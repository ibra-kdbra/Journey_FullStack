import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export function ValidateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.params);

        if (error) {
            // Handle validation error
            return res.status(400).json({ error: error.details[0].message });
        }

        // Params are valid, proceed to the next middleware
        next();
    }
}