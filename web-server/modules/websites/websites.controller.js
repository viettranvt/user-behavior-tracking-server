const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const HttpStatus = require("http-status-codes");
const mongoose = require('mongoose');

const requestUtil = require('../../utils/RequestUtil');
const WebsitesConstant = require('./websites.constant');
const WebsitesService = require('./websites.service');
const ErrorsService = require('../errors/errors.services');

const getWebsites = async (req, res, next) => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_CONTROLLER}::getWebsites::is called`);
  try{
    const user = req.user;
    let websites = await WebsitesService.getWebsitesByUserId(user["_id"]);
    websites = await WebsitesService.checkDomainListWithTrackingCode(websites);

    const info = {
      status: HttpStatus.OK,
      messages: [WebsitesConstant.MESSAGES.GET_WEBSITES_LIST.GET_WEBSITES_LIST_SUCCESSFULLY],
      data: {
        websites
      }
    };

    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_CONTROLLER}::getWebsites::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_CONTROLLER}::getWebsites::error`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: WebsitesConstant.LOGGER.WEBSITES_CONTROLLER,
      functionName: "getWebsites"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

const checkDomainTrackingCode = async (req, res, next) => {
  logger.info(`${WebsitesConstant.LOGGER.WEBSITES_CONTROLLER}::checkDomainTrackingCode::is called`);
  try{
    let info = null;
    let website = req.website;

    await WebsitesService.checkDomainWithTrackingCode(website);

    info = {
      status: HttpStatus.OK,
      messages: [WebsitesConstant.MESSAGES.CHECK_DOMAIN_TRACKING_CODE.VERIFY_DOMAIN_AND_CODE_ATTACHED_SUCCESSFULLY],
      data: {
        website
      }
    };
    logger.info(`${WebsitesConstant.LOGGER.WEBSITES_CONTROLLER}::checkDomainTrackingCode::success`);
		return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${WebsitesConstant.LOGGER.WEBSITES_CONTROLLER}::checkDomainTrackingCode::error`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: WebsitesConstant.LOGGER.WEBSITES_CONTROLLER,
      functionName: "checkDomainTrackingCode"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

module.exports = {
  getWebsites,
  checkDomainTrackingCode
};