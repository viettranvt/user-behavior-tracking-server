const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const HttpStatus = require("http-status-codes");

const SearchEventConstant = require("./search-events-log.constant");
const SearchEventService = require("./search-events-log.service");
const requestUtil = require('../../utils/RequestUtil');

const { CreateSearchLogValidationSchema } = require("./validations/create-log.schema");

const createSearchLog = async (req, res, next) => {
    logger.info(`${SearchEventConstant.LOGGER.CONTROLLER}::createSearchLog::is called`);
    try{
         //check input
        const { error } = Joi.validate(req.body, CreateSearchLogValidationSchema);

        if (error) {
            return requestUtil.joiValidationResponse(error, res);
        }

        const { uuid, userId, productIds, keyword } = req.body;
        await SearchEventService.createSearchLog({uuid, userId, productIds, keyword});

        logger.info(`${SearchEventConstant.LOGGER.CONTROLLER}::createSearchLog::success`);
        return res.status(HttpStatus.OK).json({
            status: HttpStatus.OK,
            messages: [SearchEventConstant.MESSAGE.CREATE_LOG.SUCCESS]
        });
    }catch(e){
        logger.error(`${SearchEventConstant.LOGGER.CONTROLLER}::createSearchLog::error`, e);
        return next(e)
    }
};

module.exports = {
    createSearchLog
};
