const log4js = require('log4js');
const logger = log4js.getLogger('Services');

const UserStatisticsByDayConstant = require('./user-statistics-by-day.constant');
const UserStatisticsByDayModel = require('./user-statistics-by-day.model');

const getReportByWeekHasConditions = async (startDate, endDate) => {
  logger.info(`${UserStatisticsByDayConstant.LOGGER.USER_STATISTICS_BY_DAY_SERVICE}::getReportByWeekHasConditions::is called`);
  try{
   
    const conditions = {
      searchDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    logger.info(`${UserStatisticsByDayConstant.LOGGER.USER_STATISTICS_BY_DAY_SERVICE}::getReportByWeekHasConditions::success`, JSON.stringify(conditions));
    return await UserStatisticsByDayModel.find(conditions).sort({searchDate: 1});
  }catch(e){
    logger.error(`${UserStatisticsByDayConstant.LOGGER.USER_STATISTICS_BY_DAY_SERVICE}::getReportByWeekHasConditions::error`, e);
  }
};

module.exports = {
  getReportByWeekHasConditions
};