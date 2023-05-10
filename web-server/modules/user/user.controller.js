const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const HttpStatus = require("http-status-codes");

const requestUtil = require('../../utils/RequestUtil');
const UserConstant = require("./user.constant");
const UserServices = require('./user.service');
const ErrorsService = require('../errors/errors.services');

const { LoginValidationSchema } = require('./validations/login.schema');
const { UpdatePasswordValidationSchema } = require('./validations/update-pass-word.schema');

const login = async(req, res, next) => {
  logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::Login::is called`);
  try{
    //check input
    const { error } = Joi.validate(req.body, LoginValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    const { email, password } = req.body;
    let info = {};
    const user = await UserServices.findUserByUsernameOrEmail(email);

    //user not found
    if(!user){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [UserConstant.MESSAGES.LOGIN.MAIL_NOT_FOUND_OR_PASSWORD_NOT_MATCH],
      };

      logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::Login::user not found`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //password not match
    if(! UserServices.isValidPasswordHash({passwordHash: user.passwordHash, password})){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [UserConstant.MESSAGES.LOGIN.MAIL_NOT_FOUND_OR_PASSWORD_NOT_MATCH],
      };

      logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::Login::password not match`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //success
    info = {
      status: HttpStatus.OK,
      messages: [UserConstant.MESSAGES.LOGIN.LOGIN_SUCCESSFULLY],
      data: {
        user: UserServices.mapUserInfo(user),
        meta: {
          accessToken: UserServices.generateToken({id: user._id})
        }
      }
    };

    logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::Login::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e) {
    logger.error(`${UserConstant.LOGGER.USER_CONTROLLER}::Login::error `, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserConstant.LOGGER.USER_CONTROLLER,
      functionName: "Login"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

const getUserInfo = async (req, res, next) => {
  logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::getUserInfo::is called `);
  try{
    const info = {
      status: HttpStatus.OK,
      messages: [UserConstant.MESSAGES.GET_USER_INFO.GET_USER_INFO_SUCCESSFUL],
      data: {
        user: UserServices.mapUserInfo(req.user),
        meta: {
          refreshToken: UserServices.generateToken({id: req.user._id})
        }
      }
    };

    logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::getUserInfo::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${UserConstant.LOGGER.USER_CONTROLLER}::getUserInfo::error `, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserConstant.LOGGER.USER_CONTROLLER,
      functionName: "getUserInfo"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
}

const updatePassword = async (req, res, next) => {
  logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::updatePassword::is called `);
  try{
    //check input
    const { error } = Joi.validate(req.body, UpdatePasswordValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;
    let user = req.user;
    let info = {};

    //check new password and comfirm password not match
    if(newPassword != confirmPassword){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [UserConstant.MESSAGES.UPDATE_PASSWORD.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH]
      };

      logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::updatePassword::new password and confirm password not match.`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //check old password
    if(!UserServices.isValidPasswordHash({passwordHash: user.passwordHash, password: oldPassword})){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [UserConstant.MESSAGES.UPDATE_PASSWORD.CURRRENT_PASSWORD_NOT_MATCH]
      };

      logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::updatePassword::old password not match.`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //update password
    await UserServices.updatePassword({user, newPassword});

    info = {
      status: HttpStatus.OK,
      messages: [UserConstant.MESSAGES.UPDATE_PASSWORD.UPDATE_PASSWORD_SUCCESSFULLY]
    };

    logger.info(`${UserConstant.LOGGER.USER_CONTROLLER}::updatePassword::Update password successfully.`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${UserConstant.LOGGER.USER_CONTROLLER}::updatePassword::error `, e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: UserConstant.LOGGER.USER_CONTROLLER,
      functionName: "updatePassword"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

module.exports = {
  login,
  getUserInfo,
  updatePassword
};

