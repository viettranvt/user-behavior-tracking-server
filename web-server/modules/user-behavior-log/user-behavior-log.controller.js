const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const HttpStatus = require("http-status-codes");
const Url = require('url-parse');
const parser = require('ua-parser-js');
const queryString = require('query-string');
const mongoose = require('mongoose');

const UserBehaviorLogConstant = require('./user-behavior-log.constant');
const UserBehaviorLogService = require('./user-behavior-log.service');
const WebsiteService = require('../websites/websites.service');
const ErrorService = require('../errors/errors.services');
const requestUtil = require('../../utils/RequestUtil');
const UserInfoService = require('../user-info/user-info.service');

const { AddLogBehaviorValidationSchema } = require('./validations/add-log.schema');
const { UpdateTimeUnloadValidationSchema } = require('./validations/update-time-unload.schema');
const { UpdateScrollPercentageValidationSchema } = require('./validations/update-scroll-percentage.schema');

const addLog = async (req, res, next) => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::AddLog::is called`);
  try{
    //check input
    const { error } = Joi.validate(req.body, AddLogBehaviorValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    const { websiteCode, ip, uuid, href, userAgent, isPrivateBrowsing, screenResolution, browserResolution, referrer, createdAt, isClick, dosiInfo, isNewUser } = req.body;
    let info = null;
    const hrefURL = new Url(href);
    const hrefOrigin = hrefURL.origin;
    const hrefQuery = queryString.parse(hrefURL.query);

    const website = await WebsiteService.findWebsiteByCodeAndCode({ code: websiteCode, domain: hrefOrigin });

    if(!website)
    {
      info = {
        status: HttpStatus.NOT_FOUND,
        data: {
          logId: null
        },
        messages: [UserBehaviorLogConstant.MESSAGES.ADD_LOG.WEBSITE_NOT_FOUND]
      };

      logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::AddLog::website not found`);
      return res.status(HttpStatus.NOT_FOUND).json(info);
    }

    const ua = parser(userAgent);
    const location = ip != "" ? await UserBehaviorLogService.getGeoIp(ip) : null;
    const userId = UserInfoService.userIdDecrypt(dosiInfo);
    const trafficSource = UserBehaviorLogService.mappingTrafficSource({ referrer, href });

    let isSearch = false;
    if ((hrefQuery.keywords != null) && (hrefQuery.keywords != '')){
      isSearch = true;
    }

    const data = {
      uuid,
      ip,
      href,
      referrer,
      screenResolution,
      browserResolution,
      userAgent,
      location,
      websiteCode,
      isPrivateBrowsing,
      domain: hrefURL.origin,
      pathname: hrefURL.pathname,
      utmCampaign: hrefQuery.utm_campaign || null,
      utmMedium: hrefQuery.utm_medium || null,
      utmSource: hrefQuery.utm_source || null,
      createdAt,
      isClick,
      userId,
      trafficSource,
      isNewUser: isNewUser || false,
      isSearch,
      keywordsSearch: hrefQuery.keywords,
      ...ua
    };

    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::AddLog::created log`);
    const log = await UserBehaviorLogService.createUserBehaviorLog(data);

    if(userId){
      UserInfoService.checkUserInfo(userId);
    }

    info = {
      status: HttpStatus.OK,
      data: {
        logId: log._id ? log._id.toString() : null
      },
      messages: [UserBehaviorLogConstant.MESSAGES.ADD_LOG.ADD_LOG_SUCCESS]
    };
    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::AddLog::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::AddLog::error`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER,
      functionName: "AddLog"
    };
    await ErrorService.createError(errorInfo);
    return next(e);
  }
};

const updateTimeUnLoad = async (req, res, next) => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateTimeUnLoad::is called`);
  try{
    const { id } = req.params;
    let info = null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      info = {
        status: HttpStatus.BAD_REQUEST,
				messages: [UserBehaviorLogConstant.MESSAGES.UPDATE_TIME_UNLOAD.WRONG_ID],
      };
      
      logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateTimeUnLoad::wrong id`);
			return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const { error } = Joi.validate(req.body, UpdateTimeUnloadValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    const { timeUnload, timeOnPage } = req.body;
    let log = await UserBehaviorLogService.findLogById(id);

    if(!log){
      info = {
        status: HttpStatus.NOT_FOUND,
				messages: [UserBehaviorLogConstant.MESSAGES.UPDATE_TIME_UNLOAD.LOG_NOT_FOUND],
      };
      
      logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateTimeUnLoad::log not found`);
			return res.status(HttpStatus.NOT_FOUND).json(info);
    }

    log.timeUnload = timeUnload;
    log.timeOnPage = timeOnPage;

    await log.save();

    info = {
      status: HttpStatus.OK,
      messages: [UserBehaviorLogConstant.MESSAGES.UPDATE_TIME_UNLOAD.UPDATE_TIME_ON_PAGE_SUCCESSFULLY],
    };
    
    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateTimeUnLoad::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateTimeUnLoad::error`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER,
      functionName: "updateTimeUnLoad"
    };
    await ErrorService.createError(errorInfo);
    return next(e);
  }
};

const updateScrollPercentage = async (req, res, next) => {
  logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateScrollPercentage::is called`);
  try{
    const { id } = req.params;
    let info = null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      info = {
        status: HttpStatus.BAD_REQUEST,
				messages: [UserBehaviorLogConstant.MESSAGES.UPDATE_SCROLL_PERCENTAGE.WRONG_ID],
      };
      
      logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateScrollPercentage::wrong id`);
			return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const { error } = Joi.validate(req.body, UpdateScrollPercentageValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    const { scroll } = req.body;
    let log = await UserBehaviorLogService.findLogById(id);

    if(!log){
      info = {
        status: HttpStatus.NOT_FOUND,
				messages: [UserBehaviorLogConstant.MESSAGES.UPDATE_SCROLL_PERCENTAGE.LOG_NOT_FOUND],
      };
      
      logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateScrollPercentage::log not found`);
			return res.status(HttpStatus.NOT_FOUND).json(info);
    }

    log.scrollPercentage = scroll;

    await log.save();

    info = {
      status: HttpStatus.OK,
      messages: [UserBehaviorLogConstant.MESSAGES.UPDATE_SCROLL_PERCENTAGE.UPDATE_SCROLL_PERCENTAGE_SUCCESSFULLY],
    };
    
    logger.info(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateScrollPercentage::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER}::updateScrollPercentage::error`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserBehaviorLogConstant.LOGGER.USER_BEHAVIOR_LOG_CONTROLLER,
      functionName: "updateScrollPercentage"
    };
    await ErrorService.createError(errorInfo);
    return next(e);
  }
};

module.exports = {
  addLog,
  updateTimeUnLoad,
  updateScrollPercentage
};