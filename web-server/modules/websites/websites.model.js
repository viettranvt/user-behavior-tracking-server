const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const websiteSchema = new Schema({
  code: { type : String , unique : true, required : true, dropDups: true },
  domain: { type: String },
  userId: { type: Schema.Types.ObjectId },
  isTracking: { type: Boolean, default: false },
  isValid: { type: Boolean, default: false },
  isDuplicateScript: { type: Boolean, default: false }
}, { timestamps: true, paranoid: true });

const WebsiteModel = mongoose.model('Website', websiteSchema, 'Websites');
module.exports = WebsiteModel;
module.exports.Model = websiteSchema;

