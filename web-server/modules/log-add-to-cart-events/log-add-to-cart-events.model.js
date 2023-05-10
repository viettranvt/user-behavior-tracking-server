const mongoose = require('mongoose');
//const objectId =
const Schema = mongoose.Schema;

const logsAddToCartEventsSchema = new Schema({
  uuid: {type: String, default: null},
  userId: {type: Number, default: 0},
  productId: {type: Number, default: 0},
  categoryId: {type: Number, default: 0},
  brandId: {type: Number, default: 0},
  price: {type: Number, default: 0},
  quantity: {type: Number, default: 0},
  isCrawl: {type: Number, default: 0},
}, {timestamps: true, paranoid: true});

const logsAddToCartEventsModel = mongoose.model('logAddToCartEvents', logsAddToCartEventsSchema, 'logsAddToCartEvents');
module.exports = logsAddToCartEventsModel;
module.exports.Model = logsAddToCartEventsSchema;
