const Joi = require('@hapi/joi');

const GetLogValidationSchema = Joi.object().keys({
    startDate: Joi.number().min(0).required(),
    endDate: Joi.number().min(0).required(),
    url: Joi.string(),
    utmSource: Joi.string(),
    utmCampaign: Joi.string(),
    utmMedium: Joi.string(),
    page: Joi.number().min(1),
    limit: Joi.number().min(1)
  }
);

module.exports = {
  GetLogValidationSchema
};