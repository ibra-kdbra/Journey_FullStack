import Joi from "joi";

// Route ids are positive integers; reject anything else (e.g. "abc", "1 OR 1=1", "1e3").
const id = Joi.string().pattern(/^[1-9]\d{0,9}$/).messages({
    'string.pattern.base': '{{#label}} must be a positive integer',
});

export const IdParamSchema = Joi.object({ id });
export const UserIdParamSchema = Joi.object({ userId: id });
