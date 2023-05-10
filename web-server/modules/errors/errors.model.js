const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const errorSchema = new Schema({
  errorInfo: { type: String },
  module: { type: String },
  functionName: { type: String }
}, {timestamps: true, paranoid: true});

const ErrorModel = mongoose.model('Error', errorSchema, 'Errors');
module.exports = ErrorModel;
module.exports.Model = errorSchema;
