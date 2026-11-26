import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'

export function ValidateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.validateAsync(req.body).then(() => {
      next();
    }).catch(error => {
      if (Joi.isError(error)) {
        // Only the messages: the Joi error also carries `_original`, i.e. the
        // submitted body (including passwords).
        return res.status(400).json({
          status: 'error',
          message: error.details.map((d: Joi.ValidationErrorItem) => d.message).join('; '),
        });
      }
      // Anything else (e.g. a failing external lookup) goes to the error handler.
      next(error);
    });
  };
}
