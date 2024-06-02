import Joi from 'joi'
import { User } from "../../models/User"

// validate if email already exists
const lookup = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    throw new Error('Email Already Exists')
  }
}

const UserCreateSchema = Joi.object().keys({
  email: Joi.string().email().required().external(lookup),
  name: Joi.string().required(),
  password: Joi.string().required().min(8),
  password_confirmation: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .label('Confirm password')
    .messages({ 'any.only': '{{#label}} does not match' })
})

const UserUpdateSchema = Joi.object().keys({
  email: Joi.string().email(),//.external(lookup),
  name: Joi.string(),
  password: Joi.string().min(8),
  password_confirmation: Joi.any()
    .equal(Joi.ref('password'))
    .label('Confirm password')
    .messages({ 'any.only': '{{#label}} does not match' })
})

export { UserCreateSchema, UserUpdateSchema }
