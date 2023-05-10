const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userInfoSchema = new Schema({
  userId: {type: String, default: null},
  lastLogin: {type: Number, default: null},
  timestamp: {type: Number, default: null},
  firstName: {type: String, default: null},
  lastName: {type: String, default: null},
  email: {type: String, default: null},
  phone: {type: String, default: null},
  birthday: {type: Number, default: null},
  countryDescr: {type: String, default: null},
  stateDescr: {type: String, default: null},
  maqhDescr: {type: String, default: null},
  xaidDescr: {type: String, default: null},
  address: {type: String, default: null},
  points: {type: String, default: null},
  loyaltyCard: {type: String, default: null},
}, { timestamps: true, paranoid: true });

const UserInfoSchema = mongoose.model('UserInfo', userInfoSchema, 'UserInfos');
module.exports = UserInfoSchema;
module.exports.Model = userInfoSchema;