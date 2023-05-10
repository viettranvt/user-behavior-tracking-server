const mongoose = require('mongoose');

const UserConstant = require('../user/user.constant');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {type: String, default: null},
  passwordHash: {type: String},
  passwordSalt: {type: String},
  username: {type: String},
  role: {type: Number, default: UserConstant.ROLE.USER},
  phone: {type: String, default:null},
}, {timestamps: true, paranoid: true});

const UserModel = mongoose.model('User', userSchema, 'Users');
module.exports = UserModel;
module.exports.Model = userSchema;
