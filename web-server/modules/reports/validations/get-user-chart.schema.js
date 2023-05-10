const Joi = require('@hapi/joi');

const GetUserChartValidationSchema = Joi.object().keys({
    startDate: Joi.number().min(0).required(),
    endDate: Joi.number().min(0).required(),
    url: Joi.string(),
    utmSource: Joi.string(),
    utmCampaign: Joi.string(),
    utmMedium: Joi.string(),
  }
);

module.exports = {
  GetUserChartValidationSchema
};
