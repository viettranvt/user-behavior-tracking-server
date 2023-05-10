const mongoose = require('mongoose');
//const objectId =
const Schema = mongoose.Schema;

const searchEventLogsSchema = new Schema({
  uuid: {type: String, default: null},
  userId: {type: Number, default: 0},
  keyword: {type: String, default: null},
  productIds : {type: String, default: null},
}, {timestamps: true, paranoid: true});

const searchEventLogsModel = mongoose.model('searchEventLog', searchEventLogsSchema, 'searchEventLogs');
module.exports = searchEventLogsModel;
module.exports.Model = searchEventLogsSchema;
