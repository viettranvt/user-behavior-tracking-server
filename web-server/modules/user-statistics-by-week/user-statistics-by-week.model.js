const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStatisticsByWeekSchema = new Schema({
  data: {type: Object, default: null},
  startDate: {type: Date},
  endDate: {type: Date}
}, {timestamps: true, paranoid: true});

const userStatisticsByWeekModel = mongoose.model('userStatisticByWeek', userStatisticsByWeekSchema, 'userStatisticsUserByWeek');
module.exports = userStatisticsByWeekModel;
module.exports.Model = userStatisticsByWeekSchema;
