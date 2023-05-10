const log4js = require('log4js');
const logger = log4js.getLogger('App');

const WebsitesModel = require('../modules/websites/websites.model');
const UserModel = require('../modules/user/user.model');
const DumpDataConstant = require('./dump-data.constant');
const WebsiteService = require('../modules/websites/websites.service');

const createWebsite = async () => {
  logger.info(`${DumpDataConstant.LOGGER.WEBSITE_DUMP_DATA}::createWebsite::is called`);
  try{
    const domain = DumpDataConstant.DUMP_DATA.WEBSITE.websiteInfo;
    let config = DumpDataConstant.DUMP_DATA.WEBSITE.websiteDetail;
    const username = DumpDataConstant.DUMP_DATA.USER.usersInfo[0];

    const user = await UserModel.findOne({ username }).lean();

    if(!user){
      logger.info(`${DumpDataConstant.LOGGER.WEBSITE_DUMP_DATA}::createWebsite::user not found`);
      return;
    }

    const website = await WebsitesModel.findOne({domain}).lean();

    if(!website){
      config[domain].code = await WebsiteService.getCode();
      config[domain].userId = user._id;

      logger.info(`${DumpDataConstant.LOGGER.WEBSITE_DUMP_DATA}::createWebsite::creating website`);
      const newWebsite = new WebsitesModel(config[domain]);
      await newWebsite.save();
    }

    logger.info(`${DumpDataConstant.LOGGER.WEBSITE_DUMP_DATA}::createWebsite::success`);
    return;
  }catch(e){
    logger.error(`${DumpDataConstant.LOGGER.WEBSITE_DUMP_DATA}::createWebsite::error`, e);
    throw new Error(e);
  }
};

module.exports = async () => {
  await createWebsite()
};