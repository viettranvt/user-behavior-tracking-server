const log4js = require('log4js');
const logger = log4js.getLogger('Services');
const geoip = require('geoip-lite');
const mongoose = require('mongoose');
const Url = require('url-parse');
const queryString = require('query-string');

const UserBehaviorLogConstant = require('./user-behavior-log.constant');
const UserBehaviorLogModel = require('./user-behavior-log.model');
const ErrorService = require('../errors/errors.services');

const getGeoIp = async (ip) => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::getGeoIp::is called`);
  try{
    const location = await geoip.lookup(ip);

    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::getGeoIp::success`);
    return location;
  }catch(e){
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::getGeoIp::error`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE,
      functionName: "getGeoIp"
    };
    await ErrorService.createError(errorInfo);
    return null;
  }
};

const createUserBehaviorLog = async (inputData) => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::createUserBehaviorLog::is called`);
  try {
    const {
      ip, utmMedium, utmSource, utmCampaign,
      referrer, userAgent, browser, engine, isPrivateBrowsing,
      device, os, cpu, domain, pathname, uuid, websiteCode, location,
      browserResolution, screenResolution, href, isClick, userId, trafficSource, isNewUser,
      isSearch, keywordsSearch
    } = inputData;

    const newUserBehaviorLog = new UserBehaviorLogModel({
      uuid,
      websiteCode,
      href,
      ip,
      referrer,
      userAgent,
      location,
      domain,
      pathname,
      isPrivateBrowsing,
      browserResolution,
      screenResolution,
      utmCampaign: utmCampaign || null,
      utmMedium: utmMedium || null,
      utmSource: utmSource || null,
      browser: browser || null,
      engine: engine || null,
      device: device || null,
      os: os || null,
      cpu: cpu || null,
      timeUnload: new Date(),
      isClick,
      userId,
      trafficSource,
      isNewUser,
      isSearch,
      keywordsSearch
    });

    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::createUserBehaviorLog::success`);
    return await newUserBehaviorLog.save();
  } catch (e) {
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::createUserBehaviorLog::error`, e);
    throw new Error(e);
  }
};

const findLogById = async _id => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::findLogById::is called`);
  try{
    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::findLogById::success`);
    return await UserBehaviorLogModel.findOne({_id: mongoose.Types.ObjectId(_id)});
  }catch(e){
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::findLogById::error`, e);
    throw new Error(e);
  }
};

const takeTheDistinctionUtmByDate = async ({utm, startDate, endDate, websiteCode, isUser}) => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::takeTheDistinctionUtmByDate::is called`);
  try{
    let conditions ={
      websiteCode,
      createdAt: {
        $gte: new Date(startDate),
        $lt: new Date(endDate)
      }
    };

    if(isUser){
      conditions['userId'] = {
        $ne: null
      };
    }

    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::takeTheDistinctionUtmByDate::conditions`, JSON.stringify(conditions));
    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::takeTheDistinctionUtmByDate::success`);
    return await UserBehaviorLogModel.distinct(utm, conditions);
  }catch(e){
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::takeTheDistinctionUtmByDate::error`, e);
    throw new Error(e);
  }
};

const mappingTrafficSource = ({href, referrer}) => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::mappingTrafficSource::is called`);
  try{
    const hrefURL = new Url(href);
    const hrefQuery = queryString.parse(hrefURL.query);

    if (referrer) {
      const referrerURL = new Url(referrer);
      const hostname = referrerURL.hostname;
  
      if (UserBehaviorLogConstant.GOOGLE_URLs.includes(hostname.replace('www.', ''))) {
        if (hrefQuery.gclid) {
          return "google/cpc";
        }

        return "google/organic";
      } else if (hostname.replace('www.', '') === 'facebook.com') {
        if (hrefQuery.fbclid) {
          if ((hrefQuery.utm_source === 'facebook' || hrefQuery.utm_medium === 'cpc')) {
            return "facebook/cpc";
          }

          return "facebook/referral";
        }

        return hostname.replace('www.', '');
      } else if (hostname.replace('www.', '') === 'bing.com') {
        if (hrefQuery.msclkid) {
          if ((hrefQuery.utm_source || hrefQuery.utm_medium)) {
            return "bing/cpc";
          }

          return "bing/organic";
        }

        return "bing/organic";
      } else if (hostname.replace('www.', '') === 'coccoc.com') {
        if ((hrefQuery.utm_source || hrefQuery.utm_medium || hrefQuery.utm_campaign)) {
          return "coccoc/cpc";
        }

        return "coccoc/organic";
      } else {
        if (hrefQuery.gclid) {
          return "google/display";
        }

        return hostname.replace('www.', '');
      }
    } else {
      if (hrefQuery.gclid) {
        return "google/cpc";
      }
      
      return "direct/none";
    }
  }catch(e){
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_SERVICE}::mappingTrafficSource::error`, e);
    throw new Error(e);
  }
};

module.exports = {
  getGeoIp,
  createUserBehaviorLog,
  findLogById,
  takeTheDistinctionUtmByDate,
  mappingTrafficSource
};