const Joi = require('@hapi/joi');

const GetUserDetailValidationSchema = Joi.object().keys({
    websiteId: Joi.string().required(),
    uuid: Joi.string().required(),
    isClick: Joi.boolean(),
    page: Joi.number().min(1),
    limit: Joi.number().min(1),
    url: Joi.string(),
    utmSource: Joi.string(),
    utmCampaign: Joi.string(),
    utmMedium: Joi.string(),
    startDate: Joi.number().min(0).required(),
    endDate: Joi.number().min(0).required()
  }
);

module.exports = {
  GetUserDetailValidationSchema
};