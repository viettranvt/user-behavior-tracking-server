const log4js = require('log4js');
const logger = log4js.getLogger('App');
const bcrypt = require("bcrypt");

const UserModel = require('../modules/user/user.model');
const UserConstant = require('../modules/user/user.constant');
const DumpDataConstant = require('./dump-data.constant');

const createUsers = async () => {
  logger.info(`${DumpDataConstant.LOGGER.USER_DUMP_DATA}::createUsers::is called`);
  try{
    const users = DumpDataConstant.DUMP_DATA.USER.usersInfo;
    const config = DumpDataConstant.DUMP_DATA.USER.userDetail;

    await Promise.all(
      users.map(async username => {
        const user = await UserModel.findOne( { username } ).lean();

        if (!user) {
          logger.info(`${DumpDataConstant.LOGGER.USER_DUMP_DATA}::createUser::creating ${username}`);
          let userInfo = config[username];
          const salt = bcrypt.genSaltSync(UserConstant.SALT_LENGTH);
          userInfo.passwordSalt = salt;
          userInfo.passwordHash = bcrypt.hashSync('123456789', salt);

          let newUser = new UserModel(userInfo);
          await newUser.save();
        }
      })
    );

    logger.info(`${DumpDataConstant.LOGGER.USER_DUMP_DATA}::createUsers::Done`);
    return;
  }catch(e){
    logger.error(`${DumpDataConstant.LOGGER.USER_DUMP_DATA}::createUsers::error`, e);
    throw new Error(e);
  }
};

module.exports = async () => {
  await createUsers();
};