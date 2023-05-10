const Joi = require('@hapi/joi');

const CreateSearchLogValidationSchema = Joi.object().keys({
    uuid: Joi.string().required(),
    userId: Joi.number().required(),
    keyword: Joi.string().required().allow(""),
    productIds: Joi.string().required(),
  }
);

module.exports = {
  CreateSearchLogValidationSchema
};
