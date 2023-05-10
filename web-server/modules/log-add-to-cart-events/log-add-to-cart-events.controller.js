const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const HttpStatus = require("http-status-codes");

const AddToCartLogConstant = require("./log-add-to-cart-events.constant");
const AddToCartLogService = require("./log-add-to-cart-events.service");
const requestUtil = require('../../utils/RequestUtil');

const { CreateAddToCartLogValidationSchema } = require("./validations/create-log.schema");

const createAddToCartLog = async (req, res, next) => {
    logger.info(`${AddToCartLogConstant.LOGGER.CONTROLLER}::createAddToCartLog::is called`);
    try{
         //check input
        const { error } = Joi.validate(req.body, CreateAddToCartLogValidationSchema);

        if (error) {
            return requestUtil.joiValidationResponse(error, res);
        }

        const { uuid, userId, productId, categoryId, brandId, price, quantity, isCrawl } = req.body;
        await AddToCartLogService.createAddToCastLog({uuid, userId, productId, categoryId, brandId, price, quantity, isCrawl});

        logger.info(`${AddToCartLogConstant.LOGGER.CONTROLLER}::createAddToCartLog::success`);
        return res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            messages: [AddToCartLogConstant.MESSAGE.CREATE_LOG.SUCCESS]
        });
    }catch(e){
        logger.error(`${AddToCartLogConstant.LOGGER.CONTROLLER}::createAddToCartLog::error`, e);
        return next(e)
    }
};

module.exports = {
    createAddToCartLog
};
