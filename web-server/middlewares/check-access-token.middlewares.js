const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');
const config = require('config');
const mongoose = require('mongoose');
const log4js = require('log4js');
const logger = log4js.getLogger('Middlewares');

const JwtConfig = config.get('jwt');
const MiddlewaresConstant = require('./middlewares.constant');
const UserModel = require('../modules/user/user.model');
const GlobalConstant = require('../constants/global-constant.constant');

const returnInvalidToken = (req, res) => {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    status: HttpStatus.UNAUTHORIZED,
    messages: ['Invalid token'],
    data: {}
  });
};

module.exports = async (req, res, next) => {
  logger.info(`${MiddlewaresConstant.LOGGER.CHECK_ACCESS_TOKEN}::is called`);
  try {
    const token =
      req.headers[GlobalConstant.ApiTokenName] ||
      req.query[GlobalConstant.ApiTokenName];

    if (token === null || token === undefined || token === '') {
      logger.info(`${MiddlewaresConstant.LOGGER.CHECK_ACCESS_TOKEN}::access token not found.`);
      returnInvalidToken(req, res, next);
      return;
    }

    let userInfo = jwt.verify(token, JwtConfig.secret);
    const user = await UserModel.findOne({_id: mongoose.Types.ObjectId(userInfo.id)});

    if (!user) {
      logger.info(`${MiddlewaresConstant.LOGGER.CHECK_ACCESS_TOKEN}::user not found.`);
      returnInvalidToken(req, res, next);
      return;
    }

    req.user = user;
    logger.info(`${MiddlewaresConstant.LOGGER.CHECK_ACCESS_TOKEN}::success.`);
    return next();
  } catch (e) {
    logger.error(`${MiddlewaresConstant.LOGGER.CHECK_ACCESS_TOKEN}::error.`, e);
    returnInvalidToken(req, res, next);
  }
};
