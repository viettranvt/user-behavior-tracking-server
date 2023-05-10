const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const HttpStatus = require("http-status-codes");

const UserInfoConstant = require('./user-info.constant');
const UserInfoService = require('./user-info.service');
const ErrorService = require('../errors/errors.services');
const requestUtil = require('../../utils/RequestUtil');

const { CreatedUserInfoValidationSchema } = require('./validations/create-user-info.schema');

const createUserInfo = async(req, res, next) => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_CONTROLLER}::createUserInfo::is called`);
  try{
    //check input
    const { error } = Joi.validate(req.body, CreatedUserInfoValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    const { userInfo } = req.body;
    const userId = UserInfoService.userIdDecrypt(userInfo);

    if(userId){
      logger.info(`${UserInfoConstant.LOGGER.USER_INFO_CONTROLLER}::createUserInfo::checking user info`);
      await UserInfoService.checkUserInfo(userId);

      if(!req.log.userId || req.log.userId != userId){
        req.log.userId = userId;
        await req.log.save();
      }
    }

    logger.info(`${UserInfoConstant.LOGGER.USER_INFO_CONTROLLER}::createUserInfo::success`);
    res.status(HttpStatus.OK).json({
      messages: [UserInfoConstant.MESSAGES.CREATE_USE_INFO.SUCCESS]
    });
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_CONTROLLER}::createUserInfo::error`, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserInfoConstant.LOGGER.USER_INFO_CONTROLLER,
      functionName: "createUserInfo"
    };
    await ErrorService.createError(errorInfo);
    return next(e);
  }
};

module.exports = {
  createUserInfo
};