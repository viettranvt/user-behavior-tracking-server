const HttpStatus = require('http-status-codes');
const log4js = require('log4js');
const logger = log4js.getLogger('Middleware');
const mongoose = require('mongoose');

const MiddlewareConstant = require('./middlewares.constant');
const ErrorsService = require('../modules/errors/errors.services');
const UserBehaviorLogService = require('../modules/user-behavior-log/user-behavior-log.service');

module.exports = async (req, res, next) => {
  logger.info(`${MiddlewareConstant.LOGGER.CHECK_UUID}::is called`);
  try {
    const { id } = req.params;
    let info = {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      info = {
        status: HttpStatus.BAD_REQUEST,
				messages: [MiddlewareConstant.MESSAGES.CHECK_UUID.WRONG_ID],
      };
      
      logger.info(`${MiddlewareConstant.LOGGER.CHECK_UUID}::wrong log id`);
			return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const log = await UserBehaviorLogService.findLogById(id);

    if(!log){
      info = {
        status: HttpStatus.NOT_FOUND,
				messages: [MiddlewareConstant.MESSAGES.CHECK_UUID.LOG_NOT_FOUND],
      };
      
      logger.info(`${MiddlewareConstant.LOGGER.CHECK_UUID}::log not found`);
			return res.status(HttpStatus.NOT_FOUND).json(info);
    }

    req.log = log;
    logger.info(`${MiddlewareConstant.LOGGER.CHECK_UUID}::success.`);
    return next();
  } catch (e) {
    logger.error(`${MiddlewareConstant.LOGGER.CHECK_UUID}::error.`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: MiddlewareConstant.LOGGER.CHECK_UUID,
      functionName: "check-uuid"
    };
    await ErrorsService.createError(errorInfo);
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      messages: ['SYSTEM_ERROR']
    });
  }
};
