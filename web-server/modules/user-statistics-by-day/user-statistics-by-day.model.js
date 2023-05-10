const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStatisticsByDaySchema = new Schema({
  data: {type: Object, default: null},
  searchDate: {type: Date},
}, {timestamps: true, paranoid: true});

const userStatisticsByDayModel = mongoose.model('userStatisticByDay', userStatisticsByDaySchema, 'userStatisticsUserByDay');
module.exports = userStatisticsByDayModel;
module.exports.Model = userStatisticsByDaySchema;
