const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const HttpStatus = require("http-status-codes");
const moment = require('moment');
const momentTimezone = require('moment-timezone');

const requestUtil = require('../../utils/RequestUtil');
const ReportsConstant = require("./reports.constant");
const ReportsServices = require('./reports.service');
const ErrorsService = require('../errors/errors.services');
const UserBehaviorLogService = require('../user-behavior-log/user-behavior-log.service');
const UserStatisticsByWeekService = require('../user-statistics-by-week/user-statistics-by-week.service');
const UserStatisticsByDayService = require('../user-statistics-by-day/user-statistics-by-day.services');

const { GetLogChartValidationSchema } = require('./validations/get-log-chart.schema');
const { GetLogValidationSchema } = require('./validations/get-log.schema');
const { GetIpDetailValidationSchema } = require('./validations/get-ip-detail.schema');
const { GetUserChartValidationSchema } = require('./validations/get-user-chart.schema');
const { GetUserLogValidationSchema } = require('./validations/get-user-log.schema');
const { GetUserDetailValidationSchema } = require('./validations/get-user-detail.schema');

const getLogChart = async (req, res, next) => {
  logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLogChart::is called`);
  try{
    //check input
    const { error } = Joi.validate(req.query, GetLogChartValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    let { startDate, endDate, utmSource, utmCampaign, utmMedium, url } = req.query;
    startDate = new Date(Number(startDate));
    endDate = new Date(Number(endDate));
    const oneWeek = moment(startDate).add(8, 'd');
    const timeZone = '+07:00';
    let info = null;

    //start date after end date
    if(endDate < startDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_LOG_CHART.START_DATE_AFTER_END_DATE]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLogChart::start date after end date`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //The distance between the start date and the end date is more than one week
    if(oneWeek < endDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_LOG_CHART.THE_DISTANCE_BETWEEN_THE_START_DATE_AND_THE_END_DATE_IS_MORE_THAN_ONE_WEEK]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLogChart::The distance between the start date and the end date is more than one week`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const { website } = req;
    const conditions = {
      websiteCode: website.code,
      startDate,
      endDate,
      timeZone,
      url,
      utmSource,
      utmMedium,
      utmCampaign
    };
    let data = await ReportsServices.getLogChart(conditions);
    const utmSourceResponse = await UserBehaviorLogService.takeTheDistinctionUtmByDate({ utm: 'utmSource', startDate, endDate, websiteCode: website.code, isUser: false });
    const utmCampaignResponse = await UserBehaviorLogService.takeTheDistinctionUtmByDate({ utm: 'utmCampaign', startDate, endDate, websiteCode: website.code, isUser: false });
    const utmMediumResponse = await UserBehaviorLogService.takeTheDistinctionUtmByDate({ utm: 'utmMedium', startDate, endDate, websiteCode: website.code, isUser: false });
    let mapResponseDate = ReportsServices.mapGetLogChartResponse({data, startDate, endDate, utmSourceResponse, utmCampaignResponse, utmMediumResponse, isUser: false});

    info = {
      messages: [ReportsConstant.MESSAGES.GET_LOG_CHART.SUCCESS],
      data: mapResponseDate
    };

    logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLogChart::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLogChart::error`,e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: ReportsConstant.LOGGER.REPORTS_CONTROLLER,
      functionName: "getLogChart"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

const getLog = async (req, res, next) => {
  logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLog::is called`);
  try{
    //check input
    const { error } = Joi.validate(req.query, GetLogValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    let { startDate, endDate, utmSource, utmCampaign, utmMedium, url } = req.query;
    let page = Number(req.query.page) || ReportsConstant.PAGING.PAGE;
    let limit = Number(req.query.limit) || ReportsConstant.PAGING.LIMIT;
    startDate = new Date(Number(startDate));
    endDate = new Date(Number(endDate));
    const oneWeek = moment(startDate).add(8, 'd');
    let info = null;

    //start date after end date
    if(endDate < startDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_LOG.START_DATE_AFTER_END_DATE]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLog::start date after end date`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //The distance between the start date and the end date is more than one week
    if(oneWeek < endDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_LOG.THE_DISTANCE_BETWEEN_THE_START_DATE_AND_THE_END_DATE_IS_MORE_THAN_ONE_WEEK]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLog::The distance between the start date and the end date is more than one week`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const { website } = req;
    const conditions = {
      websiteCode: website.code,
      startDate,
      endDate,
      limit,
      page,
      utmSource,
      utmCampaign,
      utmMedium,
      url
    };
    let data = await ReportsServices.getLog(conditions);
    let totalItems = 0;
    let entries = [];

    if (data[0].entries.length !== 0) {
      entries = data[0].entries;
      totalItems = data[0].meta[0].totalItems
    }

    info = {
      messages: [ReportsConstant.MESSAGES.GET_LOG.SUCCESS],
      data: {
        logs: {
          entries,
          meta: {
            totalItems
          }
        }
      }
    };

    logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLog::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getLog::error`,e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: ReportsConstant.LOGGER.REPORTS_CONTROLLER,
      functionName: "getLog"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

const getIpDetail = async (req, res, next) => {
  logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getIpDetail::is called`);
  try{
    //check input
    const { error } = Joi.validate(Object.assign({}, req.params, req.query), GetIpDetailValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }
    
    const { ip } = req.params;
    const page = Number(req.query.page) || ReportsConstant.PAGING.PAGE;
    const limit = Number(req.query.limit) || ReportsConstant.PAGING.LIMIT;
    const { isClick, utmSource, utmCampaign, utmMedium, url } = req.query;
    let { startDate, endDate } = req.query;
    startDate = new Date(Number(startDate));
    endDate = new Date(Number(endDate));
    const oneWeek = moment(startDate).add(8, 'd');
    let info = null;

    //start date after end date
    if(endDate < startDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_IP_DETAIL.START_DATE_AFTER_END_DATE]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getIpDetail::start date after end date`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //The distance between the start date and the end date is more than one week
    if(oneWeek < endDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_IP_DETAIL.THE_DISTANCE_BETWEEN_THE_START_DATE_AND_THE_END_DATE_IS_MORE_THAN_ONE_WEEK]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getIpDetail::The distance between the start date and the end date is more than one week`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const { website } = req;
    const conditions = {
      websiteCode: website.code,
      ip,
      isClick,
      limit,
      page,
      utmSource,
      utmCampaign,
      utmMedium,
      url,
      startDate,
      endDate
    };
    let data = await ReportsServices.getIpDetail(conditions);
    let totalItems = 0;
    let entries = [];
    let last = {}

    if (data.result[0].entries.length !== 0) {
      const dataResponse = ReportsServices.mapGetIpDetailResponse(data);
      entries = dataResponse.entries;
      last = dataResponse.last;
      totalItems = data.result[0].meta[0].totalItems
    }
    
    info = {
      messages: [ReportsConstant.MESSAGES.GET_IP_DETAIL.SUCCESS],
      data: {
        logs: {
          entries,
          last,
          meta: {
            totalItems
          }
        }
      }
    };

    logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getIpDetail::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getIpDetail::error`,e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: ReportsConstant.LOGGER.REPORTS_CONTROLLER,
      functionName: "getIpDetail"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

const getUserChart = async (req, res, next) => {
  logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserChart::is called`);
  try{
    //check input
    const { error } = Joi.validate(req.query, GetUserChartValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    let { startDate, endDate } = req.query;
    startDate = new Date(Number(startDate));
    endDate = new Date(Number(endDate));
    const oneWeek = moment(startDate).add(8, 'd');
    const toDay = momentTimezone().tz("Asia/Ho_Chi_Minh").startOf('day');
    let info = null;


    //start date after end date
    if(endDate < startDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_CHART.START_DATE_AFTER_END_DATE]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserChart::start date after end date`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //The distance between the start date not today
    if(oneWeek < endDate){
        info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_CHART.THE_DISTANCE_BETWEEN_THE_START_DATE_AND_THE_END_DATE_IS_MORE_THAN_ONE_WEEK]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserChart::The distance between the start date and the end date is more than one week`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //the start date cannot be today
    if(startDate > toDay){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_CHART.THE_START_DATE_CANNOT_BE_TODAY]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserChart::the start date cannot be today`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    let reportByWeek = null;
    reportByWeek = await UserStatisticsByWeekService.getReportByWeekHasConditions(startDate, endDate);
    const reportByDay = await UserStatisticsByDayService.getReportByWeekHasConditions(startDate, endDate);

    if(!reportByWeek){
      reportByWeek = {
        "total": {
            "_id": null,
            "totalClicks": 0,
            "totalNumberOfNewUsers": 0,
            "totalNumberOfUsers": 0,
            "totalTimeOnPage": 0,
            "numberOfBounce": 0,
            "bounceRate": 0,
            "rateOfNewUsers": 0,
            "rateOfOldUsers": 0,
            "rateOfStay": 0,
            "averageTimeOnPage": 0,
            "theThreeMostVisitedPages": [],
            "trafficSourceInfo": {
              "most": {},
              "less": {}
            }
        },
        "vnfd": {
            "_id": null,
            "totalClicks": 0,
            "totalNumberOfNewUsers": 0,
            "totalNumberOfUsers": 0,
            "totalTimeOnPage": 0,
            "numberOfBounce": 0,
            "bounceRate": 0,
            "rateOfNewUsers": 0
        },
        "magazine": {
            "_id": null,
            "totalClicks": 0,
            "totalNumberOfNewUsers": 0,
            "totalNumberOfUsers": 0,
            "totalTimeOnPage": 0,
            "numberOfBounce": 0,
            "bounceRate": 0,
            "rateOfNewUsers": 0
        },
        "shopping": {
            "_id": null,
            "totalClicks": 0,
            "totalNumberOfNewUsers": 0,
            "totalNumberOfUsers": 0,
            "totalTimeOnPage": 0,
            "numberOfBounce": 0,
            "bounceRate": 0,
            "rateOfNewUsers": 0
        }
      }
    }
    else{
      reportByWeek = reportByWeek.data;
    }

    info = {
      messages: [ReportsConstant.MESSAGES.GET_USER_CHART.SUCCESS],
      data: {
        ...reportByWeek,
        chart: reportByDay.map(report => report.data) || []
      }
    };

    logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserChart::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserChart::error`,e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: ReportsConstant.LOGGER.REPORTS_CONTROLLER,
      functionName: "getUserChart"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

const getUserLog = async (req, res, next) => {
  logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserLog::is called`);
  try{
    //check input
    const { error } = Joi.validate(req.query, GetUserLogValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }

    let { startDate, endDate } = req.query;
    let page = Number(req.query.page) || ReportsConstant.PAGING.PAGE;
    let limit = Number(req.query.limit) || ReportsConstant.PAGING.LIMIT;
    startDate = new Date(Number(startDate));
    endDate = new Date(Number(endDate));
    const oneWeek = moment(startDate).add(8, 'd');
    const toDay = momentTimezone().tz("Asia/Ho_Chi_Minh").startOf('day');
    let info = null;

    //start date after end date
    if(endDate < startDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_LOG.START_DATE_AFTER_END_DATE]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserLog::start date after end date`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //The distance between the start date and the end date is more than one week
    if(oneWeek < endDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_LOG.THE_DISTANCE_BETWEEN_THE_START_DATE_AND_THE_END_DATE_IS_MORE_THAN_ONE_WEEK]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserLog::The distance between the start date and the end date is more than one week`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //the start date cannot be today
    if(startDate > toDay){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_LOG.THE_START_DATE_CANNOT_BE_TODAY]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserLog::the start date cannot be today`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const { website } = req;
    const conditions = {
      websiteCode: website.code,
      startDate,
      endDate,
      limit,
      page
    };
    let data = await ReportsServices.getUserLog(conditions);
    let totalItems = 0;
    let entries = [];

    if (data[0].entries.length !== 0) {
      entries = await ReportsServices.mapUserLogResponse(data);
      totalItems = data[0].meta[0].totalItems;
    }

    info = {
      messages: [ReportsConstant.MESSAGES.GET_USER_LOG.SUCCESS],
      data: {
        logs: {
          entries,
          meta: {
            totalItems
          }
        }
      }
    };

    logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserLog::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserLog::error`,e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: ReportsConstant.LOGGER.REPORTS_CONTROLLER,
      functionName: "getUserLog"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

const getUserDetail = async (req, res, next) => {
  logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserDetail::is called`);
  try{
    //check input
    const { error } = Joi.validate(Object.assign({}, req.params, req.query), GetUserDetailValidationSchema);

    if (error) {
      return requestUtil.joiValidationResponse(error, res);
    }
    
    const { uuid } = req.params;
    const page = Number(req.query.page) || ReportsConstant.PAGING.PAGE;
    const limit = Number(req.query.limit) || ReportsConstant.PAGING.LIMIT;
    const { isClick, utmSource, utmCampaign, utmMedium, url } = req.query;
    let { startDate, endDate } = req.query;
    startDate = new Date(Number(startDate));
    endDate = new Date(Number(endDate));
    const oneWeek = moment(startDate).add(8, 'd');
    let info = null;

    //start date after end date
    if(endDate < startDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_DETAIL.START_DATE_AFTER_END_DATE]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserDetail::start date after end date`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    //The distance between the start date and the end date is more than one week
    if(oneWeek < endDate){
      info = {
        status: HttpStatus.BAD_REQUEST,
        messages: [ReportsConstant.MESSAGES.GET_USER_DETAIL.THE_DISTANCE_BETWEEN_THE_START_DATE_AND_THE_END_DATE_IS_MORE_THAN_ONE_WEEK]
      }

      logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserDetail::The distance between the start date and the end date is more than one week`);
      return res.status(HttpStatus.BAD_REQUEST).json(info);
    }

    const { website } = req;
    const conditions = {
      websiteCode: website.code,
      uuid,
      isClick,
      limit,
      page,
      utmSource,
      utmCampaign,
      utmMedium,
      url,
      startDate, 
      endDate
    };
    let data = await ReportsServices.getUserDetail(conditions);
    let totalItems = 0;
    let entries = [];
    let last = {};

    if (data.result[0].entries.length !== 0) {
      const dataResponse = await ReportsServices.mapUserDetailResponse(data);
      entries = dataResponse.logJsonParse;
      last = dataResponse.last;
      totalItems = data.result[0].meta[0].totalItems;
    }

    info = {
      messages: [ReportsConstant.MESSAGES.GET_USER_DETAIL.SUCCESS],
      data: {
        logs: {
          entries,
          last,
          meta: {
            totalItems
          }
        }
      }
    };

    logger.info(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserDetail::success`);
    return res.status(HttpStatus.OK).json(info);
  }catch(e){
    logger.error(`${ReportsConstant.LOGGER.REPORTS_CONTROLLER}::getUserDetail::error`,e);
    const errorInfo = {
      error: e.message ? e.message : JSON.stringify(e),
      module: ReportsConstant.LOGGER.REPORTS_CONTROLLER,
      functionName: "getUserDetail"
    };
    await ErrorsService.createError(errorInfo);
    return next(e);
  }
};

module.exports = {
  getLogChart,
  getLog,
  getIpDetail,
  getUserChart,
  getUserLog,
  getUserDetail
};