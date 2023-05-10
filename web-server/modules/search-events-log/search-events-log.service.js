const log4js = require('log4js');
const logger = log4js.getLogger('Services');

const SearchEventConstant = require("./search-events-log.constant");
const SearchEventModel = require("./search-events-log.model");

const createSearchLog = async ({uuid, userId, productIds, keyword}) => {
    logger.info(`${SearchEventConstant.LOGGER.SERVICE}::createSearchLog::is called`);
    try{
        const newAddToCastLog = new SearchEventModel({
            uuid: uuid || null,
            userId: userId || 0,
            productIds: JSON.stringify(productIds) || null, 
            keyword: keyword || null,
        });

        logger.info(`${SearchEventConstant.LOGGER.SERVICE}::createSearchLog::success`);
        return await newAddToCastLog.save();
    }catch(e){
        logger.error(`${SearchEventConstant.LOGGER.SERVICE}::createSearchLog::error`, e);
        throw new Error(e);
    }
};

module.exports = {
    createSearchLog
};
