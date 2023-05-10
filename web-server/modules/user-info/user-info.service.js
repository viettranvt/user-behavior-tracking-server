const log4js = require('log4js');
const logger = log4js.getLogger('Services');
const config = require('config');
const fetch = require('node-fetch');

const DosiInfo = config.get('dosi');
const UserInfoConstant = require('./user-info.constant');
const UserInfoModel = require('./user-info.model');

const checkUserInfo = async (userId) => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::checkUserInfo::is called`);
  try{
    let user = await findUserInfoByUuidAndUserId(userId);

    if(user && user['firstName']){
      logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::checkUserInfo::user exists`);
      return;
    }

    const userInfo = await getUserInfoFromDosi(userId);

    if(user){
      if(userInfo){
        await updateUserInfo({user, userInfo});
      }

      logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::checkUserInfo::update success`);
      return;
    }

    logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::checkUserInfo::create user info`);
    await createUserInfo({userId, userInfo});
    return;
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::checkUserInfo::error`, e);
    throw new Error(e);
  }
};

const userIdDecrypt = userId => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::userIdDecrypt::is called`);
  try{
    if(!userId){
      logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::userIdDecrypt::user is empty`);
      return null;
    }

    let userIdParse = userId.replace('3535192', '');
    userIdParse = userIdParse.replace('291456', '');

    if(userIdParse == ''){
      logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::userIdDecrypt::user is empty`);
      return null;
    }

    logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::userIdDecrypt::success`);
    return userIdParse;
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::userIdDecrypt::error`, e);
    throw new Error(e);
  }
};

const updateUserInfo = async ({user, userInfo}) => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::updateUserInfo::is called`);
  try{
    user['lastLogin'] = userInfo.last_login || null;
    user['timestamp'] = userInfo.timestamp || null;
    user['firstName'] = userInfo.firstname || null;
    user['lastName'] = userInfo.lastname || null;
    user['email'] = userInfo.email || null;
    user['phone'] = userInfo.phone || null;
    user['birthday'] = userInfo.birthday || null;
    user['countryDescr'] = userInfo.country_descr || null;
    user['stateDescr'] = userInfo.state_descr || null;
    user['maqhDescr'] = userInfo.maqh_descr || null;
    user['xaidDescr'] = userInfo.xaid_descr || null;
    user['address'] = userInfo.address || null;
    user['points'] = userInfo.points || null;
    user['loyaltyCard'] = userInfo.loyalty_card || null;

    logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::updateUserInfo::update user`);
    return await user.save()
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::updateUserInfo::error`, e);
    throw new Error(e);
  }
};

const createUserInfo = async({userInfo, userId}) => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::createUserInfo::is called`);
  try{
    let user = {
      userId
    };

    if(userInfo){
      user['lastLogin'] = userInfo.last_login || null;
      user['timestamp'] = userInfo.timestamp || null;
      user['firstName'] = userInfo.firstname || null;
      user['lastName'] = userInfo.lastname || null;
      user['email'] = userInfo.email || null;
      user['phone'] = userInfo.phone || null;
      user['birthday'] = userInfo.birthday || null;
      user['countryDescr'] = userInfo.country_descr || null;
      user['stateDescr'] = userInfo.state_descr || null;
      user['maqhDescr'] = userInfo.maqh_descr || null;
      user['xaidDescr'] = userInfo.xaid_descr || null;
      user['address'] = userInfo.address || null;
      user['points'] = userInfo.points || null;
      user['loyaltyCard'] = userInfo.loyalty_card || null;
    }

    logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::createUserInfo::success`);
    const newUser = new UserInfoModel(user);

    return newUser.save();
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::createUserInfo::error`, e);
    throw new Error(e);
  }
};

const getUserInfoFromDosi = async userId => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::getUserInfoFromDosi::is called`);
  try{
    let url = DosiInfo.userInfoUrl;
    const key = DosiInfo.keyEncode;
    url = url.replace('{key}', key);
    url = url.replace('{id}', userId);

    const res = await fetch(url);
    const data = await res.json();

    if(!data || !data.user_id){
      return null;
    }

    return data;
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::getUserInfoFromDosi::error`, e);
    return null;
  }
};

const findUserInfoByUuidAndUserId = async(userId) => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::findUserInfoByUuidAndUserId::is called`);
  try{
    logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::findUserInfoByUuidAndUserId::success`);
    return await UserInfoModel.findOne({userId});
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::findUserInfoByUuidAndUserId::error`, e);
    throw new Error(e);
  }
};

const getUserInfoByUsersId = async (ids) => {
  logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::getUserInfoByUsersId::is called`);
  try{
    logger.info(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::getUserInfoByUsersId::success`);
    return await UserInfoModel.find({
      userId: {
        $in: ids
      }
    });
  }catch(e){
    logger.error(`${UserInfoConstant.LOGGER.USER_INFO_SERVICE}::getUserInfoByUsersId::error`, e);
    throw new Error(e);
  }
};

module.exports = {
  checkUserInfo,
  userIdDecrypt,
  getUserInfoByUsersId
};