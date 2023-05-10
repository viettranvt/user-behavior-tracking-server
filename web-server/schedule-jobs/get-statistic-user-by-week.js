const schedule = require('node-schedule');
const log4js = require('log4js');
const logger = log4js.getLogger('Tasks');
const Async = require('async');

const config = require('config');
const statisticUserByWeekTime = config.get('appScheduleJobs').getStatisticUserByWeekTime;
const moment = require('moment-timezone');

const WebsitesServices = require('../modules/websites/websites.service');
const UserBehaviorLogModel = require('../modules/user-behavior-log/user-behavior-log.model');
const UserStatisticsByWeekModel = require('../modules/user-statistics-by-week/user-statistics-by-week.model');

const getUserChart = async ({websiteCode, startDate, endDate, url}) => {
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

    if(url){
      matchStage.$match['href'] = {
        $regex : url,
        $options : 'i'
      };
    }

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
        totalClicks: {
          $sum: 1
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
        totalClicks: 1,
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

    let totalUser = {};
    
    if(result.length == 1){
      totalUser = result[0];
    }else{
      totalUser['_id'] = null;
      totalUser['totalClicks'] = 0;
      totalUser['totalNumberOfNewUsers'] = 0;
      totalUser['totalNumberOfUsers'] = 0;
    }

    if(!url){
      totalUser = {
        total: totalUser
      };
    }else{
      if(url == 'vnfd'){
        totalUser = {
          vnfd: totalUser
        };
      }else{
        totalUser = {
          magazine: totalUser
        };
      }
    }

    return totalUser;
  }catch(e){
    logger.error(`scheduleJobs::getUserChart::error`, e);
    throw new Error(e);
  }
};

const getTimeOnPageOfUsers = async ({websiteCode, startDate, endDate, url}) => {
  logger.info(`scheduleJobs::getTimeOnPageOfUsers::is called`);
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

    if(url){
      matchStage.$match['href'] = {
        $regex : url,
        $options : 'i'
      };
    }

    const projectStage = {
      $project: {
        uuid: 1,
        timeOnPage: 1
      }
    };

    const sortStage =  {
      $sort: {
        "uuid": -1
      }  
    };

    const groupStage = { 
      $group: { 
        _id: '$uuid',
        timeOnLastPage: {
          $last: '$timeOnPage'
        }
      }
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      groupStage
    ];

    const queryInfo = JSON.stringify(query);
    logger.info(`scheduleJobs::getTimeOnPageOfUsers::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
      
    logger.info(`scheduleJobs::getTimeOnPageOfUsers::success`);

    let info = {
      totalTimeOnPage: 0,
      numberOfBounce: 0
    };
    
    if(result.length > 0){
      const totalTimeOnPage = Number(parseFloat(result.reduce((total, value) => total + value.timeOnLastPage, 0)).toFixed(2));
      const numberOfBounce = result.reduce((total, value) => {
        if(value.timeOnLastPage < 4){
          return total + 1;
        }

        return total;
      }, 0);

      info = {
        totalTimeOnPage,
        numberOfBounce
      };
    }

    if(!url){
      info = {
        total: info
      };
    }else{
      if(url == 'vnfd'){
        info = {
          vnfd: info
        };
      }else{
        info = {
          magazine: info
        };
      }
    }

    return info;
  }catch(e){
    logger.error(`scheduleJobs::getUserChart::error`, e);
    throw new Error(e);
  }
};

const getTheNumberOfUrls = async ({websiteCode, startDate, endDate}) => {
  logger.info(`scheduleJobs::getTheNumberOfUrls::is called`);
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
        href: 1
      }
    };

    const sortStage =  {
      $sort: {
        "href": -1
      }  
    };

    const groupStage = { 
      $group: { 
        _id: '$href',
        amount : { 
          $sum: 1
        }
      }
    };

    const projectStage1 = {
      $project: {
        amount: 1
      }
    };

    const sortStage1 =  {
      $sort: {
        "amount": -1
      }  
    };

    const limitStage = {
      $limit: 3
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      groupStage,
      projectStage1,
      sortStage1,
      limitStage
    ];

    const queryInfo = JSON.stringify(query);
    logger.info(`scheduleJobs::getTheNumberOfUrls::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
      
    logger.info(`scheduleJobs::getTheNumberOfUrls::success`);

    return result;
  }catch(e){
    logger.error(`scheduleJobs::getTheNumberOfUrls::error`, e);
    throw new Error(e);
  }
};

const getTheNumberOfTrafficSource = async ({websiteCode, startDate, endDate}) => {
  logger.info(`scheduleJobs::getTheNumberOfTrafficSource::is called`);
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
        "trafficSource": 1
      }
    };

    const sortStage =  {
      $sort: {
        "trafficSource": -1
      }  
    };

    const groupStage = { 
      $group: { 
        _id: '$trafficSource',
        amount : { 
          $sum: 1
        }
      }
    };

    const sortStage1 = {
      $sort: {
        "amount": -1
      }
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      groupStage,
      sortStage1
    ];

    const queryInfo = JSON.stringify(query);
    logger.info(`scheduleJobs::getTheNumberOfTrafficSource::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
      
    logger.info(`scheduleJobs::getTheNumberOfTrafficSource::success`);

    let info = {
      most: null,
      less: null
    };

    if(result.length == 1){
      info = {
        most: result[0],
        less: result[0]
      }
    }

    if(result.length > 2){
      info = {
        most: result[0],
        less: result[result.length - 1]
      }
    }

    return info;
  }catch(e){
    logger.error(`scheduleJobs::getTheNumberOfTrafficSource::error`, e);
    throw new Error(e);
  }
};

const getShoppingData = ({total, vnfd, magazine}) => {
  logger.info(`scheduleJobs::getShoppingData::is called`);
  try{
    let totalNumberOfUsers = 0;
    let totalClicks = 0;
    let totalTimeOnPage = 0;
    let numberOfBounce = 0;
    let totalNumberOfNewUsers = 0;
    let bounceRate = 0;
    let rateOfNewUsers = 0;

    totalNumberOfUsers = total['total'].totalNumberOfUsers - (vnfd['vnfd'].totalNumberOfUsers + magazine['magazine'].totalNumberOfUsers);
    totalClicks = total['total'].totalClicks - (vnfd['vnfd'].totalClicks + magazine['magazine'].totalClicks);
    totalTimeOnPage = total['total'].totalTimeOnPage - (vnfd['vnfd'].totalTimeOnPage + magazine['magazine'].totalTimeOnPage);
    numberOfBounce = total['total'].numberOfBounce - (vnfd['vnfd'].numberOfBounce + magazine['magazine'].numberOfBounce);
    totalNumberOfNewUsers = total['total'].totalNumberOfNewUsers - (vnfd['vnfd'].totalNumberOfNewUsers + magazine['magazine'].totalNumberOfNewUsers); 

    if(totalNumberOfNewUsers > 0){
      rateOfNewUsers = Number(parseFloat((totalNumberOfNewUsers / totalNumberOfUsers) * 100).toFixed(2));
    }

    if(numberOfBounce > 0){
      bounceRate = Number(parseFloat((numberOfBounce / totalNumberOfUsers) * 100).toFixed(2));
    }

    logger.info(`scheduleJobs::getShoppingData::success`);
    return { 
      shopping: {
        _id: null,
        totalClicks,
        totalNumberOfNewUsers,
        totalNumberOfUsers,
        totalTimeOnPage,
        numberOfBounce,
        bounceRate,
        rateOfNewUsers
      }
    };
  }catch(e){
    logger.error(`scheduleJobs::getShoppingData::error`, e);
    throw new Error(e);
  }
};

const saveUserStatisticsData = async({startDate, endDate, total, vnfd, magazine, shopping}) => {
  logger.info(`scheduleJobs::saveUserStatisticsData::is called`);
  try{
    let data = {
      total: total.total,
      vnfd: vnfd.vnfd,
      magazine: magazine.magazine,
      shopping: shopping.shopping
    };

    const newRecord = new UserStatisticsByWeekModel({
      data,
      startDate,
      endDate
    });

    await newRecord.save()
    logger.info(`scheduleJobs::saveUserStatisticsData::success`);
  }catch(e){
    logger.error(`scheduleJobs::saveUserStatisticsData::error`, e);
    throw new Error(e);
  }
}

const mapData = ({total, totalTimeOnPage, vnfd, vnfdTimeOnPage, magazine, magazineTimeOnPage, mostVisitedPageInformation, trafficSourceInfo}) => {
  logger.info(`scheduleJobs::mapData::is called`);
  try{
    total.total['totalTimeOnPage'] = totalTimeOnPage.total['totalTimeOnPage'];
    total.total['numberOfBounce'] = totalTimeOnPage.total['numberOfBounce'];
    total.total['bounceRate'] = 0;
    total.total['rateOfNewUsers'] = 0;
    total.total['rateOfOldUsers'] = 0;
    total.total['rateOfStay'] = 0;
    total.total['averageTimeOnPage'] = 0;
    total.total['theThreeMostVisitedPages'] = mostVisitedPageInformation;
    total.total['trafficSourceInfo'] = trafficSourceInfo;

    if(total.total['totalNumberOfUsers'] > 0){
      total.total['rateOfNewUsers'] = Number(parseFloat((total.total['totalNumberOfNewUsers'] / total.total['totalNumberOfUsers']) * 100).toFixed(2));
      total.total['rateOfOldUsers'] = Number(parseFloat((100 - total.total['rateOfNewUsers'])).toFixed(2));
      total.total['bounceRate'] = Number(parseFloat((totalTimeOnPage.total['numberOfBounce'] / total.total['totalNumberOfUsers']) * 100).toFixed(2));
      total.total['rateOfStay'] = Number(parseFloat((100 - total.total['bounceRate'])).toFixed(2));
      total.total['averageTimeOnPage'] = Number(parseFloat((totalTimeOnPage.total['totalTimeOnPage'] / total.total['totalNumberOfUsers'])).toFixed(2));
    }

    vnfd.vnfd['totalTimeOnPage'] = vnfdTimeOnPage.vnfd['totalTimeOnPage'];
    vnfd.vnfd['numberOfBounce'] = vnfdTimeOnPage.vnfd['numberOfBounce'];
    vnfd.vnfd['bounceRate'] = 0;
    vnfd.vnfd['rateOfNewUsers'] = 0;

    if(vnfd.vnfd['totalNumberOfUsers'] > 0){
      vnfd.vnfd['rateOfNewUsers'] = Number(parseFloat((vnfd.vnfd['totalNumberOfNewUsers'] / vnfd.vnfd['totalNumberOfUsers']) * 100).toFixed(2));
      vnfd.vnfd['bounceRate'] = Number(parseFloat((vnfdTimeOnPage.vnfd['numberOfBounce'] / vnfd.vnfd['totalNumberOfUsers']) * 100).toFixed(2));
    }

    magazine.magazine['totalTimeOnPage'] = magazineTimeOnPage.magazine['totalTimeOnPage'];
    magazine.magazine['numberOfBounce'] = magazineTimeOnPage.magazine['numberOfBounce'];
    magazine.magazine['bounceRate'] = 0;
    magazine.magazine['rateOfNewUsers'] = 0;

    if(magazine.magazine['totalNumberOfUsers'] > 0){
      magazine.magazine['rateOfNewUsers'] = Number(parseFloat((magazine.magazine['totalNumberOfNewUsers'] / magazine.magazine['totalNumberOfUsers']) * 100).toFixed(2));
      magazine.magazine['bounceRate'] = Number(parseFloat((magazineTimeOnPage.magazine['numberOfBounce'] / magazine.magazine['totalNumberOfUsers']) * 100).toFixed(2));
    }

    logger.info(`scheduleJobs::mapData::success`);
    return { total, vnfd, magazine };
  }catch(e){
    logger.error(`scheduleJobs::mapData::error`, e);
    throw new Error(e);
  }
};

module.exports = () => {
  schedule.scheduleJob(statisticUserByWeekTime, async() => {
    try{
      const startDate = moment().tz("Asia/Ho_Chi_Minh").subtract(7, 'd').startOf('day');
      const endDate = moment().tz("Asia/Ho_Chi_Minh").subtract(1, 'd').endOf('day');
      const website = await WebsitesServices.findWebsiteByDomain(config.get('tracking').webTracking);
      
      if(website){
        let conditions = {
          websiteCode: website.code,
          startDate,
          endDate
        };

        const vnfdConditions = {
          websiteCode: website.code,
          startDate,
          endDate,
          url: "vnfd"
        };

        const magazineConditions = {
          websiteCode: website.code,
          startDate,
          endDate,
          url: "magazine"
        };
        
        let total = await getUserChart(conditions);
        let vnfd = await getUserChart(vnfdConditions);
        let magazine =  await getUserChart(magazineConditions);;
        const totalTimeOnPage = await getTimeOnPageOfUsers(conditions);
        const vnfdTimeOnPage = await getTimeOnPageOfUsers(vnfdConditions);
        const magazineTimeOnPage = await getTimeOnPageOfUsers(magazineConditions);
        const mostVisitedPageInformation = await getTheNumberOfUrls(conditions);
        const trafficSourceInfo = await getTheNumberOfTrafficSource(conditions);
        const data = mapData({total, totalTimeOnPage, vnfd, vnfdTimeOnPage, magazine, magazineTimeOnPage, mostVisitedPageInformation, trafficSourceInfo});
        total = data.total;
        vnfd = data.vnfd;
        magazine = data.magazine;
        const shopping = getShoppingData({total, vnfd, magazine});
        await saveUserStatisticsData({startDate, endDate, total, vnfd, magazine, shopping});
      }
    }catch(e){
      logger.error('scheduleJobs::getStatisticUserByWeek::error', e);
      return;
    }
  })
}; 