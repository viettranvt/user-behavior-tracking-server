const schedule = require('node-schedule');
const log4js = require('log4js');
const logger = log4js.getLogger('Tasks');

const config = require('config');
const getStatisticUserByDayTime = config.get('appScheduleJobs').getStatisticUserByDayTime;
const moment = require('moment-timezone');

const WebsitesServices = require('../modules/websites/websites.service');
const UserBehaviorLogModel = require('../modules/user-behavior-log/user-behavior-log.model');
const userStatisticsByDayModel = require('../modules/user-statistics-by-day/user-statistics-by-day.model');

const getUserChart = async ({ websiteCode, startDate, endDate }) => {
  logger.info(`scheduleJobs::getUserChart::is called`);
  try{
    let matchStage =  {
      $match: {
        websiteCode,
        isClick: true,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }  
    };

    const projectStage = {
      $project: {
        uuid: 1,
        isNewUser: 1
      }
    };

    const sortStage =  {
      $sort: {
        "uuid": -1
      }  
    };

    const groupStage = { 
      $group: { 
        _id: null,
        uuidList : { 
          $addToSet: '$uuid'
        },
        totalNumberOfNewUsers: {
          $sum: {
            $cond : [{$eq: ["$isNewUser", true]}, 1, 0] 
          }
        }
      }
    };

    const projectStage1 = {
      $project: {
        totalNumberOfUsers: {'$size':'$uuidList'},
        totalNumberOfNewUsers: 1
      }
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      groupStage,
      projectStage1
    ];

    const queryInfo = JSON.stringify(query);
    logger.info(`scheduleJobs::getUserChart::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
      
    logger.info(`scheduleJobs::getUserChart::success`);
    return result;
  }catch(e){
    logger.error(`scheduleJobs::getUserChart::error`, e);
    throw new Error(e);
  }
};

const saveUserStatisticsData = async(startDate, totalUsers) => {
  logger.info(`scheduleJobs::saveUserStatisticsData::is called`);
  try{
    const day = startDate.date() < 10 ? '0' + startDate.date() : startDate.date();
    const date = day + "/" + (startDate.month() + 1) + "/" + startDate.year();
    
    let users = {};
  
    if(totalUsers.length == 1){
      users = totalUsers[0];
    }else{
      users = {
        _id: null,
        totalNumberOfUsers: 0,
        totalNumberOfNewUsers: 0
      }
    }

    let data = {};
    data[date] = {
      ...users,
      day: String(day),
      month: String((startDate.month() + 1)),
      year: String(startDate.year())
    };

    const newRecord = new userStatisticsByDayModel({
      data,
      searchDate: startDate
    });

    await newRecord.save()
    logger.info(`scheduleJobs::saveUserStatisticsData::success`);
  }catch(e){
    logger.error(`scheduleJobs::saveUserStatisticsData::error`, e);
    throw new Error(e);
  }
}

module.exports = () => {
  schedule.scheduleJob(getStatisticUserByDayTime, async() => {
    try{
      const startDate = moment().tz("Asia/Ho_Chi_Minh").subtract(1, 'd').startOf('day');
      const endDate = moment().tz("Asia/Ho_Chi_Minh").subtract(1, 'd').endOf('day');
      const website = await WebsitesServices.findWebsiteByDomain(config.get('tracking').webTracking);
      
      if(website){
        let conditions = {
          websiteCode: website.code,
          startDate,
          endDate
        };

        const totalUsers = await getUserChart(conditions);
        await saveUserStatisticsData(startDate, totalUsers);
      }
    }catch(e){
      logger.error('scheduleJobs::getStatisticUserByDay::error', e);
      console.error(JSON.stringify(e));
      return;
    }
  })
}; 