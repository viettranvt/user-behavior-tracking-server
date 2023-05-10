const log4js = require('log4js');
const logger = log4js.getLogger('Services');
const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('config');

const Request = require('../../utils/Request');
const Tracking = config.get('tracking')
const WebsitesModel = require('./websites.model');
const WebsitesConstant = require('./websites.constant');

const getCode = async () => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::getCode::is called`);
  try{
    let flag = true;
    let code = null;
    while (flag) {
      code = crypto.randomBytes(4).toString('hex');
      const website = await WebsitesModel.findOne({ code });

      if (!website) {
        flag = false;
      }
    }

    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::getCode::success`);
    return code;
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::getCode::error`, e);
    throw new Error(e);
  }
};

const getWebsitesByUserId = async userId => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::getWebsites::is called`);
  try{
    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::getWebsites::is called`);
    return await WebsitesModel.find({ userId });
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::getWebsites::error`, e);
    throw new Error(e);
  }
};

const checkDomainWithTrackingCode = async website => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainWithTrackingCode::is called.`, {website});
  try{
    const html = await Request.getHTML(website.domain);
   
    if (html !== null) {
      const script = WebsitesConstant.TRACKING_SCRIPT.replace('{code}', website.code);
      website.isValid = true;
      website.isTracking = html.indexOf(script) !== -1 ? true : false;
      const splitHtml = html.split('\n');
      website.isDuplicateScript = (splitHtml.filter(e => e.indexOf(Tracking.trackingScript)!== -1 )).length > 1 ? true : false;

      logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainWithTrackingCode::Domain is valid.`);
    } else {
      website.isValid = false;
      website.isTracking = false;
      website.isDuplicateScript = false;

      logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainWithTrackingCode::Domain does not have tracking code.`);
    }

    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainWithTrackingCode::success.`);
    return await website.save();
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainWithTrackingCode::error.`, e);
    throw new Error(e);
  }
};

const findWebsiteById = async websiteId => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteById::is called.`);
  try{
    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteById::success.`);
    return await WebsitesModel.findOne({ _id: mongoose.Types.ObjectId(websiteId) });
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteById::error.`, e);
    throw new Error(e);
  }
};

const checkDomainListWithTrackingCode = async websites => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainListWithTrackingCode::is called.`);
  try{
    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainListWithTrackingCode::success.`);
    return await Promise.all(websites.map(async (website) => {
      return await checkDomainWithTrackingCode(website);
    }));
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::checkDomainListWithTrackingCode::error.`, e);
    throw new Error(e);
  }
};

const findWebsiteByCodeAndCode = async ({ code, domain }) => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteByCodeAndCode::is called.`);
  try{
    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteByCodeAndCode::success.`);
    return await WebsitesModel.findOne({ code, domain }).lean();
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteByCodeAndCode::error.`, e);
    throw new Error(e);
  }
};

const findWebsiteByDomain = async ( domain) => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteByDomain::is called.`);
  try{
    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteByDomain::success.`);
    return await WebsitesModel.findOne({ domain }).lean();
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_SERVICES}::findWebsiteByDomain::error.`, e);
    throw new Error(e);
  }
};

module.exports = {
  getCode,
  getWebsitesByUserId,
  checkDomainWithTrackingCode,
  findWebsiteById,
  checkDomainListWithTrackingCode,
  findWebsiteByCodeAndCode,
  findWebsiteByDomain
};