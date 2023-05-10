const log4js = require('log4js');
const logger = log4js.getLogger('Services');

const ReportConstant = require('./reports.constant');
const UserBehaviorLogModel = require('../user-behavior-log/user-behavior-log.model');
const UserInfoService = require('../user-info/user-info.service');

const getLogChart = async ({websiteCode, startDate, endDate, timeZone, utmSource, utmCampaign, utmMedium, url}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLogChart::is called`);
  try{
    let matchStage =  {
      $match: {
        websiteCode,
        isClick: true,
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      }  
    };

    if(utmSource){
      matchStage.$match['utmSource'] = utmSource;
    }

    if(utmCampaign){
      matchStage.$match['utmCampaign'] = utmCampaign;
    }

    if(utmMedium){
      matchStage.$match['utmMedium'] = utmMedium;
    }

    if(url){
      matchStage.$match['href'] = {
        $regex : url,
        $options : 'i'
      };
    }

    const projectStage = {
      $project: {
        createdAt: 1
      }
    };

    const sortStage =  {
      $sort: {
        "createdAt": -1
      }  
    };

    let groupStage = { 
      $group: { 
        _id: { 
          $dateToString: { format: "%d/%m/%Y", date: "$createdAt", timezone: timeZone} 
        },
        click: { 
          $sum: 1
        }
      }
    };

    const sortIdStage =  {
      $sort: {
        "_id": 1
      }  
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      groupStage,
      sortIdStage
    ];

    const queryInfo = JSON.stringify(query);
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLogChart::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
      
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLogChart::success`);
    return result;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLogChart::error`, e);
    throw new Error(e);
  }
};

const mapGetLogChartResponse = ({data, startDate, endDate, utmSourceResponse, utmCampaignResponse, utmMediumResponse, isUser}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapGetLogChartResponse::is called`);
  try{
    let nextDay = new Date(startDate);
    const clickTotal = data.reduce((total, ele) => total + ele.click, 0);
    const distanceDay = Math.floor(Math.abs(endDate - startDate)/(1000 * 60 * 60 * 24));
    const dataJsonParse = JSON.parse(JSON.stringify(data));
    const dateInfoArr = [];

    if(distanceDay == 0){
      const dateInfo = mapDateInfo({dataJsonParse, nextDay, isUser});
      dateInfoArr.push(dateInfo);
    }else{
      for(let i = 0; i < distanceDay; i++){
        if(i == 0){
          const dateInfo = mapDateInfo({dataJsonParse, nextDay, isUser});
          dateInfoArr.push(dateInfo);
          nextDay.setDate(nextDay.getDate() + 1);
        }

        const dateInfo = mapDateInfo({dataJsonParse, nextDay, isUser});
        dateInfoArr.push(dateInfo);
        nextDay.setDate(nextDay.getDate() + 1);
      };
    }

    let result = {
      overview: {
        utmTotal: utmSourceResponse.length || 0
      },
      statistics: dateInfoArr,
      utm: {
        utmSource: utmSourceResponse,
        utmCampaign: utmCampaignResponse,
        utmMedium: utmMediumResponse
      }
    };

    if(isUser)
    {
      result.overview['userTotal'] = clickTotal;
      return result;
    }

    result.overview['clickTotal'] = clickTotal;
    return result;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapGetLogChartResponse::error`, e);
    throw new Error(e);
  }
};

const mapDateInfo = ({dataJsonParse, nextDay, isUser}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapDateInfo::is called`);
  try{
    const day = nextDay.getDate() < 10 ? '0' + nextDay.getDate() : nextDay.getDate();
    const month = (nextDay.getMonth() + 1) < 10 ? '0' + (nextDay.getMonth() + 1) : (nextDay.getMonth() + 1);
    const year = nextDay.getFullYear();
    const date = day + '/' + month + '/' + year; 
    let info = dataJsonParse.find(dayInfo => dayInfo._id == date);

    if(!info){
      let infoAfterMap = {
        _id: date,
        day: day.toString(),
        month: month.toString(),
        year: year.toString(),
        click: 0
      };

      if(isUser){
        infoAfterMap['user'] = 0
        return infoAfterMap;
      }

      infoAfterMap['click'] = 0
      return infoAfterMap;
    }

    let infoAfterMap = {
      _id: info._id,
      day: day.toString(),
      month: month.toString(),
      year: year.toString(),
    };

    if(isUser){
      infoAfterMap['user'] = info.click;
      return infoAfterMap;
    }

    infoAfterMap['click'] = info.click;
    return infoAfterMap;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapDateInfo::error`, e);
    throw new Error(e);
  }
};

const getLog = async ({websiteCode, startDate, endDate, limit, page, utmSource, utmCampaign, utmMedium, url}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLog::is called`);
  try{
    let matchStage =  {
      $match: {
        websiteCode,
        isClick: true,
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      }  
    };

    if(utmSource){
      matchStage.$match['utmSource'] = utmSource;
    }

    if(utmCampaign){
      matchStage.$match['utmCampaign'] = utmCampaign;
    }

    if(utmMedium){
      matchStage.$match['utmMedium'] = utmMedium;
    }

    if(url){
      matchStage.$match['href'] = {
        $regex : url,
        $options : 'i'
      };
    }

    const projectStage = {
      $project: {
        createdAt: 1,
        ip: 1,
        timeOnPage: 1,
        referrer: 1,
        trafficSource: 1,
        domain: 1,
        pathname: 1,
        utmSource: 1,
        utmCampaign: 1,
        utmMedium: 1
      }
    };

    const sortStage =  {
      $sort: {
        "createdAt": -1
      }  
    };

    const facetStage = {
      $facet: 
      {
        entries: [
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        meta: [
          {$group: {_id: null, totalItems: {$sum: 1}}},
        ],
      }
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      facetStage
    ];
    const queryInfo = JSON.stringify(query);
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLog::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
      
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLog::success`);
    return result;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getLog::error`, e);
    throw new Error(e);
  }
};

const mapGetIpDetailResponse = (data) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapGetIpDetailResponse::is called`);
  try{
    let dataJsonParse = JSON.parse(JSON.stringify(data.result[0].entries));
    dataJsonParse = dataJsonParse.map(logData => {
      let tempData = logData;

      if(!tempData['device']){
        tempData['device'] = {
          vendor: null,
          model: null,
          type: null
        };
      }else{
        tempData['device'] = {
          vendor: tempData['device'].vendor || null,
          model: tempData['device'].model || null,
          type: tempData['device'].type || null
        };
      }

      return tempData;
    });

    let lastIpJsonParse = JSON.parse(JSON.stringify(data.lastIpInfo));

    if(!lastIpJsonParse['device']){
      lastIpJsonParse['device'] = {
        vendor: null,
        model: null,
        type: null
      };
    }else{
      lastIpJsonParse['device'] = {
        vendor: lastIpJsonParse['device'].vendor || null,
        model: lastIpJsonParse['device'].model || null,
        type: lastIpJsonParse['device'].type || null
      };
    }

    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapGetIpDetailResponse::success`);
    return { entries: dataJsonParse, last: lastIpJsonParse };
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapGetIpDetailResponse::error`, e);
    throw new Error(e);
  }
};

const getIpDetail = async ({ websiteCode, ip, isClick, limit, page, utmSource, utmCampaign, utmMedium, url, startDate, endDate }) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getIpDetail::is called`);
  try{
    let matchStage =  {
      $match: {
        websiteCode,
        ip,
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      }  
    };

    if(utmSource){
      matchStage.$match['utmSource'] = utmSource;
    }

    if(utmCampaign){
      matchStage.$match['utmCampaign'] = utmCampaign;
    }

    if(utmMedium){
      matchStage.$match['utmMedium'] = utmMedium;
    }

    if(url){
      matchStage.$match['href'] = {
        $regex : url,
        $options : 'i'
      };
    }

    if(isClick){
      matchStage.$match['isClick'] = true;
    }

    if(isClick == false || isClick == 'false'){
      matchStage.$match['isClick'] = false;
    }

    const projectStage = {
      $project: {
        createdAt: 1,
        timeOnPage: 1,
        referrer: 1,
        trafficSource: 1,
        domain: 1,
        pathname: 1,
        utmSource: 1,
        utmMedium: 1,
        device: 1,
        isPrivateBrowsing: 1,
        browser: 1,
        os: 1,
        location: 1
      }
    };

    const sortStage =  {
      $sort: {
        "createdAt": -1
      }  
    };

    const facetStage = {
      $facet: 
      {
        entries: [
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        meta: [
          {$group: {_id: null, totalItems: {$sum: 1}}},
        ],
      }
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      facetStage
    ];
    const queryInfo = JSON.stringify(query);
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getIpDetail::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
    let lastIpInfo = {};
   
    if(result[0].entries.length !== 0)
    {
      let conditions = {
        ip,
        websiteCode,
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      };

      if(utmSource){
        conditions['utmSource'] = utmSource;
      }
  
      if(utmCampaign){
        conditions['utmCampaign'] = utmCampaign;
      }
  
      if(utmMedium){
        conditions['utmMedium'] = utmMedium;
      }
  
      if(url){
        conditions['href'] = {
          $regex : url,
          $options : 'i'
        };
      }
  
      if(isClick){
        conditions['isClick'] = true;
      }
  
      if(isClick == false || isClick == 'false'){
        conditions['isClick'] = false;
      }

      logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getIpDetail::getLastIp`, JSON.stringify(conditions));
      lastIpInfo = await UserBehaviorLogModel
      .findOne(conditions)
      .select({createdAt: 1, location: 1, device: 1})
      .sort({createdAt: -1})
      .lean();
    }
      
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getIpDetail::success`);
    return { result, lastIpInfo };
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getIpDetail::error`, e);
    throw new Error(e);
  }
};

const getUserDetail = async ({websiteCode, limit, page, utmSource, utmCampaign, utmMedium, url, uuid, isClick, startDate, endDate}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserDetail::is called`);
  try{
    let matchStage =  {
      $match: {
        websiteCode,
        uuid,
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      }  
    };

    if(isClick){
      matchStage.$match['isClick'] = true;
    }

    if(isClick == false || isClick == 'false'){
      matchStage.$match['isClick'] = false;
    }

    if(utmSource){
      matchStage.$match['utmSource'] = utmSource;
    }

    if(utmCampaign){
      matchStage.$match['utmCampaign'] = utmCampaign;
    }

    if(utmMedium){
      matchStage.$match['utmMedium'] = utmMedium;
    }

    if(url){
      matchStage.$match['href'] = {
        $regex : url,
        $options : 'i'
      };
    }

    const projectStage = {
      $project: {
        userId: 1,
        createdAt: 1,
        ip: 1,
        timeOnPage: 1,
        referrer: 1,
        trafficSource: 1,
        domain: 1,
        pathname: 1,
        utmSource: 1,
        utmCampaign: 1,
        utmMedium: 1,
        device: 1,
        isPrivateBrowsing: 1,
        browser: 1,
        os: 1,
        location: 1
      }
    };

    const sortStage =  {
      $sort: {
        "createdAt": -1
      }  
    };

    const facetStage = {
      $facet: 
      {
        entries: [
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        meta: [
          {$group: {_id: null, totalItems: {$sum: 1}}},
        ],
      }
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      facetStage
    ];
    const queryInfo = JSON.stringify(query);
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserDetail::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
    let last = {};

    if(result[0].entries.length !== 0)
    {
      let conditions = {
        websiteCode,
        uuid,
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      };

      if(isClick){
        conditions['isClick'] = true;
      }
  
      if(isClick == false || isClick == 'false'){
        conditions['isClick'] = false;
      }

      if(utmSource){
        conditions['utmSource'] = utmSource;
      }
  
      if(utmCampaign){
        conditions['utmCampaign'] = utmCampaign;
      }
  
      if(utmMedium){
        conditions['utmMedium'] = utmMedium;
      }
  
      if(url){
        conditions['href'] = {
          $regex : url,
          $options : 'i'
        };
      }

      logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserDetail::getLastIp`, JSON.stringify(conditions));
      const lastIpInfo = await UserBehaviorLogModel
      .findOne(conditions)
      .select({createdAt: 1, location: 1, device: 1, userId: 1})
      .sort({createdAt: -1})
      .lean();

      if(lastIpInfo){
        last = lastIpInfo;
      }
    }
      
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserDetail::success`);
    return { result, last };
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserDetail::error`, e);
    throw new Error(e);
  }
};

const onlyUnique = (value, index, self) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::onlyUnique::is called`);
  try{
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::onlyUnique::success`);
    return self.indexOf(value) === index;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::onlyUnique::error`, e);
    throw new Error(e);
  }
};

const mapUserLogResponse = async (data) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserLogResponse::is called`);
  try{
    let logJsonParse = JSON.parse(JSON.stringify(data[0].entries));
    let uuidList = logJsonParse.map(log => log.uuidLast);
    let usersId = uuidList.map(log => log.userId);
    usersId = usersId.filter(onlyUnique) || [];

    let users = [];
    users = await UserInfoService.getUserInfoByUsersId(usersId);
    mapData = mapUserInfoWithUuid({users, logJsonParse: uuidList});

    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserLogResponse::success`);
    return mapData;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserLogResponse::error`, e);
    throw new Error(e);
  }
};

const mapUserInfoWithUuid = ({users, logJsonParse}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserInfoWithUuid::is called`);
  try{
    logJsonParse = logJsonParse.map(log => {
      let tempData = log;

      if(users.length == 0){
        tempData['userInfo'] = {}
        return tempData;
      }

      const userInfo = users.filter(user => user.userId == log.userId);
      tempData['userInfo'] = userInfo.length > 0 ? userInfo[0] : {};
      return tempData;
    });

    return logJsonParse;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserInfoWithUuid::error`, e);
    throw new Error(e);
  }
};

const getUserLog = async ({websiteCode, startDate, endDate, limit, page}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserLog::is called`);
  try{
    let matchStage =  {
      $match: {
        websiteCode,
        isClick: true,
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      }  
    };

    const projectStage = {
      $project: {
        createdAt: 1,
        uuid: 1,
        timeOnPage: 1,
        userId: 1,
        trafficSource: 1,
        domain: 1,
        pathname: 1,
        isNewUser: 1
      }
    };

    const sortStage =  {
      $sort: {
        "createdAt": -1,
        "_id": -1
      }  
    };

    const groupStage = { 
      $group: { 
        _id: '$uuid',
        dateLast: {
          $first: '$createdAt'
        },
        uuidLast: {
          $first: '$$ROOT'
        }
      }
    };

    const sortStage1 = { 
      $sort: {
        "dateLast": -1
      }  
    };

    const facetStage = {
      $facet: 
      {
        entries: [
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        meta: [
          {$group: {_id: null, totalItems: {$sum: 1}}},
        ],
      }
    };

    const query = [
      matchStage,
      projectStage,
      sortStage,
      groupStage,
      sortStage1,
      facetStage
    ];
    const queryInfo = JSON.stringify(query);
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserLog::query`, {queryInfo});

    const result = await UserBehaviorLogModel.aggregate(query).allowDiskUse(true);
      
    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserLog::success`);
    return result;
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::getUserLog::error`, e);
    throw new Error(e);
  }
};

const mapUserDetailResponse = async data => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserDetailResponse::is called`);
  try{
    let last = data.last;
    let userJsonParse = JSON.parse(JSON.stringify(data.result[0].entries));
    let usersId = userJsonParse.map(log => log.userId);

    if(last != {} && last['userId']){
      usersId.push(last['userId']);
    }

    usersId = usersId.filter(onlyUnique) || [];
    let users = [];
    users = await UserInfoService.getUserInfoByUsersId(usersId);
    mapData = mapUserDetailWithUuid({users, logJsonParse: userJsonParse, last});

    logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserDetailResponse::success`);
    return mapData;  
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserDetailResponse::error`, e);
    throw new Error(e);
  }
};

const mapUserDetailWithUuid = ({users, logJsonParse, last}) => {
  logger.info(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserDetailWithUuid::is called`);
  try{
    logJsonParse = logJsonParse.map(log => {
      let tempData = log;

      if(!tempData['device']){
        tempData['device'] = {
          vendor: null,
          model: null,
          type: null
        };
      }else{
        tempData['device'] = {
          vendor: tempData['device'].vendor || null,
          model: tempData['device'].model || null,
          type: tempData['device'].type || null
        };
      }

      if(users.length == 0){
        tempData['userInfo'] = {}
        return tempData;
      }

      const userInfo = users.filter(user => user.userId == log.userId);
      tempData['userInfo'] = userInfo.length > 0 ? userInfo[0] : {};
      return tempData;
    });

    if(last != {}){
      last = JSON.parse(JSON.stringify(last));

      if(!last['device']){
        last['device'] = {
          vendor: null,
          model: null,
          type: null
        };
      }else{
        last['device'] = {
          vendor: last['device'].vendor || null,
          model: last['device'].model || null,
          type: last['device'].type || null
        };
      }

      let userId = null;
      let userInfo = [];

      if(last['userId'])
      {
        userId = last.userId || null;
        userInfo = users.filter(user => user.userId == userId);
      }

      last['userInfo'] = userInfo.length > 0 ? userInfo[0] : {};
    }

    return { logJsonParse, last };
  }catch(e){
    logger.error(`${ReportConstant.LOGGER.REPORTS_SERVICE}::mapUserDetailWithUuid::error`, e);
    throw new Error(e);
  }
};
 
module.exports = {
  getLogChart,
  mapGetLogChartResponse,
  getLog,
  mapGetIpDetailResponse,
  getIpDetail,
  getUserDetail,
  mapUserLogResponse,
  getUserLog,
  mapUserDetailResponse
};