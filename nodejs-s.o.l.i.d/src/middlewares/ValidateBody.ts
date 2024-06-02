import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'

export function ValidateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.validateAsync(req.body).then(() => {
      next();
    }).catch(error => res.status(400).send(error));
  };
}
