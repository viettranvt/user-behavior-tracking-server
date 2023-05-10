const Joi = require('@hapi/joi');

const CreateAddToCartLogValidationSchema = Joi.object().keys({
    uuid: Joi.string().required(),
    userId: Joi.number().required(),
    productId: Joi.number().required(),
    categoryId: Joi.number().required(),
    brandId:  Joi.number().required(),
    price:  Joi.number().required().min(0),
    quantity: Joi.number().required().min(1),
    isCrawl: Joi.number().required(),
  }
);

module.exports = {
  CreateAddToCartLogValidationSchema
};
