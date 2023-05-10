const request = require('request');
const log4js = require('log4js');
const logger = log4js.getLogger('App');

const getHTML = (uri) => {
  logger.info(`Utils::getHTML::is called`)
  try{
    return new Promise((resolve) => {
      const options = {
        uri,
        method: 'GET',
        rejectUnauthorized: false,
        timeout: 10000
      };
  
      request(options, (err, httpResponse, body) => {
        if (err) {
          logger.info(`Utils::getHTML::get html fail`, err);
          return resolve(null);
        }
  
        logger.info(`Utils::getHTML::success`)
        return resolve(body);
      });
    });
  }catch(e){
    logger.error(`Utils::getHTML::error`, e)
    throw new Error(e);
  }
};

module.exports = {
  getHTML
};