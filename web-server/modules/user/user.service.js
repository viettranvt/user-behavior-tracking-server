const log4js = require('log4js');
const logger = log4js.getLogger('Services');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const JwtConfig = config.get('jwt');
const UserConstant = require('./user.constant');
const UserModel = require('./user.model');

const isValidPasswordHash = ({passwordHash, password}) => {
  logger.info(`${UserConstant.LOGGER.USER_SERVICE}::isValidHashPassword::Is called`);
  try{
    logger.info(`${UserConstant.LOGGER.USER_SERVICE}::isValidHashPassword::success`);
    return bcrypt.compareSync(password, passwordHash);
  }catch(e){
    logger.error(`${UserConstant.LOGGER.USER_SERVICE}::isValidHashPassword::Error`, e);
    throw new Error(e);
  }
};

const generateToken = (data) => {
  logger.info(`${UserConstant.LOGGER.USER_SERVICE}::generateToken::Is called`);
  try{
    logger.info(`${UserConstant.LOGGER.USER_SERVICE}::generateToken::success`);
    return jwt.sign(data, JwtConfig.secret, {
      expiresIn: (60 * 60) * JwtConfig.tokenExpiredInHour
    });
  }catch(e){
    logger.error(`${UserConstant.LOGGER.USER_SERVICE}::generateToken::Error`, e);
    throw new Error(e);
  }
};

const findUserByUsernameOrEmail = async usernameOrEmail => {
  logger.info(`${UserConstant.LOGGER.USER_SERVICE}::findUserByUsernameOrEmail::is called`);
  try{
    const query = {
      "$or": [{
        "username": usernameOrEmail
      },{
        "email": usernameOrEmail
      }]
    };

    logger.info(`${UserConstant.LOGGER.USER_SERVICE}::findUserByUsernameOrEmail::success`);
    return await UserModel.findOne(query);
  }catch(e){
    logger.error(`${UserConstant.LOGGER.USER_SERVICE}::findUserByUsernameOrEmail::Error`, e);
    throw new Error(e);
  }
};

const mapUserInfo = userInfo => {
  logger.info(`${UserConstant.LOGGER.USER_SERVICE}::mapUserInfo::is called`);
  try{
    let userJsonParse = JSON.parse(JSON.stringify(userInfo));

    delete userJsonParse.passwordHash;
    delete userJsonParse.passwordSalt;
    delete userJsonParse.createdAt;
    delete userJsonParse.updatedAt;

    return userJsonParse;
  }catch(e){
    logger.error(`${UserConstant.LOGGER.USER_SERVICE}::mapUserInfo::Error`, e);
    throw new Error(e);
  }
};

const updatePassword = async ({user, newPassword}) => {
  logger.info(`${UserConstant.LOGGER.USER_SERVICE}::updatePassword::is called`);
  try{
    const salt = bcrypt.genSaltSync(UserConstant.SALT_LENGTH);
    user.passwordSalt = salt;
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    
    await user.save();

    logger.info(`${UserConstant.LOGGER.USER_SERVICE}::updatePassword::success`);
    return;
  }catch(e){
    logger.error(`${UserConstant.LOGGER.USER_SERVICE}::updatePassword::Error`, e);
    throw new Error(e);
  }
};

module.exports = {
  isValidPasswordHash,
  generateToken,
  findUserByUsernameOrEmail,
  mapUserInfo,
  updatePassword
}


