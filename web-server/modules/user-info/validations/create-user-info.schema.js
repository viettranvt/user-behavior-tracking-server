const Joi = require('@hapi/joi');

const CreatedUserInfoValidationSchema = Joi.object().keys({
  userInfo: Joi.string().required()
});

module.exports = {
  CreatedUserInfoValidationSchema
};
