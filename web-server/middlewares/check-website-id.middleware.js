const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const log4js = require('log4js');
const logger = log4js.getLogger('Middleware');

const MiddlewareConstant = require('./middlewares.constant');
const ErrorsService = require('../modules/errors/errors.services');
const WebsitesService = require('../modules/websites/websites.service');

module.exports = async (req, res, next) => {
  logger.info(`${MiddlewareConstant.LOGGER.CHECK_WEBSITE_ID}::is called`);
  try {
    const { websiteId } = req.params;
    let info = {};

    if (!mongoose.Types.ObjectId.isValid(websiteId)) {
      info = {
        status: HttpStatus.BAD_REQUEST,
				messages: [MiddlewareConstant.MESSAGES.CHECK_WEBSITE_ID.WRONG_ID],
      };
      
      logger.info(`${MiddlewareConstant.LOGGER.CHECK_WEBSITE_ID}::wrong websiteId`);
			return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const website = await WebsitesService.findWebsiteById(websiteId);

    if(!website){
      info = {
        status: HttpStatus.NOT_FOUND,
				messages: [MiddlewareConstant.MESSAGES.CHECK_WEBSITE_ID.WEBSITE_NOT_FOUND],
      };
      
      logger.info(`${MiddlewareConstant.LOGGER.CHECK_WEBSITE_ID}::website not found`);
			return res.status(HttpStatus.NOT_FOUND).json(info);
    }

    const { user } = req;

    if(website.userId.toString() != user._id.toString()){
      info = {
        status: HttpStatus.BAD_REQUEST,
				messages: [MiddlewareConstant.MESSAGES.CHECK_WEBSITE_ID.WEBSITE_UNDER_THE_MANAGEMENT_OF_OTHER]
      };
      
      logger.info(`${MiddlewareConstant.LOGGER.CHECK_WEBSITE_ID}::website under the management of other`);
			return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    req.website = website;
    logger.info(`${MiddlewareConstant.LOGGER.CHECK_WEBSITE_ID}::success.`);
    return next();
  } catch (e) {
    logger.error(`${MiddlewareConstant.LOGGER.CHECK_WEBSITE_ID}::error.`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: MiddlewareConstant.LOGGER.CHECK_WEBSITE_ID,
      functionName: "checkWebsiteId"
    };
    await ErrorsService.createError(errorInfo);
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      messages: ['SYSTEM_ERROR']
    });
  }
};
