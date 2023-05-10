const log4js = require('log4js');
const logger = log4js.getLogger('Services');

const AddToCastLogConstant = require("./log-add-to-cart-events.constant");
const AddToCastLogModel = require("./log-add-to-cart-events.model");

const createAddToCastLog = async ({uuid, userId, productId, categoryId, brandId, price, quantity, isCrawl}) => {
    logger.info(`${AddToCastLogConstant.LOGGER.SERVICE}::createAddToCastLog::is called`);
    try{
        const newAddToCastLog = new AddToCastLogModel({
            uuid: uuid || null,
            userId: userId || 0,
            productId: productId || 0, 
            categoryId: categoryId || 0,
            brandId: brandId || 0,
            price: price || 0,
            quantity: quantity || 0,
            isCrawl: isCrawl || 0
        });

        logger.info(`${AddToCastLogConstant.LOGGER.SERVICE}::createAddToCastLog::success`);
        return await newAddToCastLog.save();
    }catch(e){
        logger.error(`${AddToCastLogConstant.LOGGER.SERVICE}::createAddToCastLog::error`, e);
        throw new Error(e);
    }
};

module.exports = {
    createAddToCastLog
};
