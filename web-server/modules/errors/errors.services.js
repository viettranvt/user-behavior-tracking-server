const log4js = require('log4js');
const logger = log4js.getLogger('Services');

const ErrorConstant = require('./errors.constant');
const ErrorModel = require('./errors.model');

const createError = async ({error, module, functionName}) => {
  logger.info(`${ErrorConstant.LOGGER.ERROR_SERVICES}::createError::is called`);
  try{
    const newError = new ErrorModel({
      errorInfo: error,
      module,
      functionName
    });

    logger.info(`${ErrorConstant.LOGGER.ERROR_SERVICES}::createError::success`);
    await newError.save();
  }catch(e){
    logger.error(`${ErrorConstant.LOGGER.ERROR_SERVICES}::createError::error`, e);
    throw new Error(e);
  }
};

module.exports = {
  createError
};