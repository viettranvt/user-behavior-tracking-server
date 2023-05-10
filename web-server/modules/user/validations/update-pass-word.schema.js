const Joi = require('@hapi/joi');

const UpdatePasswordValidationSchema = Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().required()
  }
);

module.exports = {
  UpdatePasswordValidationSchema
};

