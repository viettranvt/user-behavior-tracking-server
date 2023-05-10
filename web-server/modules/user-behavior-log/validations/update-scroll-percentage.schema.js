const Joi = require('@hapi/joi');

const UpdateScrollPercentageValidationSchema = Joi.object().keys({
  scroll: Joi.number().min(0).max(100).required()
});

module.exports = {
  UpdateScrollPercentageValidationSchema
};
