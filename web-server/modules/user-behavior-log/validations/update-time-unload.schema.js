const Joi = require('@hapi/joi');

const UpdateTimeUnloadValidationSchema = Joi.object().keys({
  timeUnload: Joi.number().required(),
  timeOnPage: Joi.number().required()
});

module.exports = {
  UpdateTimeUnloadValidationSchema
};
