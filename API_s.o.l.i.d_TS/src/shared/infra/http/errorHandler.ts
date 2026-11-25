import { NextFunction, Request, Response } from "express";

import { AppError } from "../../errors/AppError";

// Express recognises an error handler by its four-argument signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    // Unexpected error: keep the detail in the server log, never in the response.
    console.error(err);
    return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
}
