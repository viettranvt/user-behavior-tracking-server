const Joi = require('@hapi/joi');
const regexMail = /^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/;

const LoginValidationSchema = Joi.object().keys({
    email: Joi.string().regex(regexMail).required(),
    password: Joi.string().required()
  }
);

module.exports = {
  LoginValidationSchema
};

