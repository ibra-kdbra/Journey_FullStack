import Joi from "joi";

export const ExportTypeSchema = Joi.object({
    type: Joi.string().valid(...['excel', 'pdf']).required(),
});
