const Joi = require('@hapi/joi');

const AddLogBehaviorValidationSchema = Joi.object().keys({
  ip: Joi.string().ip({version: ['ipv4', 'ipv6']}).allow("").required(),
  websiteCode: Joi.string().required(),
  uuid: Joi.string().required(),
  href: Joi.string().required(),
  userAgent: Joi.string().required(),
  referrer: Joi.string().allow('').optional(),
  isPrivateBrowsing: Joi.boolean().required(),
  screenResolution: Joi.object(),
  browserResolution: Joi.object(),
  createdAt: Joi.number().required(),
  isClick: Joi.boolean().required(),
  dosiInfo: Joi.string(),
  isNewUser: Joi.boolean()
});

module.exports = {
  AddLogBehaviorValidationSchema
};
