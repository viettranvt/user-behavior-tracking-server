const log4js = require('log4js');
const logger = log4js.getLogger('Services');

const UserStatisticsByWeekConstant = require('./user-statistics-by-week.constant');
const UserStatisticsByWeekModel = require('./user-statistics-by-week.model');

const getReportByWeekHasConditions = async (startDate, endDate) => {
  logger.info(`${UserStatisticsByWeekConstant.LOGGER.USER_STATISTICS_BY_WEEK_SERVICE}::getReportByWeekHasConditions::is called`);
  try{
   
    const conditions = {
      startDate: {
        $gte: new Date(startDate)
        
      },
      endDate: {
        $lte: new Date(endDate)
      }
    };

    logger.info(`${UserStatisticsByWeekConstant.LOGGER.USER_STATISTICS_BY_WEEK_SERVICE}::getReportByWeekHasConditions::success`, JSON.stringify(conditions));
    return await UserStatisticsByWeekModel.findOne(conditions);
  }catch(e){
    logger.error(`${UserStatisticsByWeekConstant.LOGGER.USER_STATISTICS_BY_WEEK_SERVICE}::getReportByWeekHasConditions::error`, e);
  }
};

module.exports = {
  getReportByWeekHasConditions
};