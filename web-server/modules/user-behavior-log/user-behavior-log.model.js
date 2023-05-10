const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userBehaviorLogSchema = new Schema({
  uuid: {type: String, default: null},
  websiteCode: {type: String, default: null},
  pathname: {type: String, default: null},
  domain: {type: String, default: null},
  browserResolution: {
    width: {type: Number, default: null},
    height: {type: Number, default: null}
  },
  screenResolution: {
    width: {type: Number, default: null},
    height: {type: Number, default: null}
  },
  location: {type: Object, default: null},
  utmMedium: {type: String, default: null},
  utmSource: {type: String, default: null},
  utmCampaign: {type: String, default: null},
  referrer: {type: String, default: null},
  href: {type: String, default: null},
  userAgent: {type: String, default: null},
  browser: {type: Object, default: null},
  engine: {type: Object, default: null},
  device: {type: Object, default: null},
  os: {type: Object, default: null},
  ip: {type: Object, default: null},
  cpu: {type: Object, default: null},
  isPrivateBrowsing: {type: Boolean, default: false},
  timeUnload: {type: Date, default: null},
  timeOnPage: {type: Number, default: 0 }, // in milliseconds
  scrollPercentage: {type: Number, default: 0},
  isClick: {type: Boolean, default: null},
  userId: {type: String, default: null},
  trafficSource: {type: String, default: null},
  isNewUser: {type: Boolean, default: false},
  isSearch: {type: Boolean, default: false},
  keywordsSearch: {type: String, default: null}
}, { timestamps: true, paranoid: true });

const UserBehaviorLogSchema = mongoose.model('UserBehaviorLog', userBehaviorLogSchema, 'UserBehaviorLogs');
module.exports = UserBehaviorLogSchema;
module.exports.Model = userBehaviorLogSchema;

