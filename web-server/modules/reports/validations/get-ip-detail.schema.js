const Joi = require('@hapi/joi');

const GetIpDetailValidationSchema = Joi.object().keys({
    websiteId: Joi.string().required(),
    ip: Joi.string().ip({version: ['ipv4', 'ipv6']}).required(),
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
  GetIpDetailValidationSchema
};