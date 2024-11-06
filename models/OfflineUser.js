const mongoose = require('mongoose');

const offlineUserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  isStudent: Boolean,
  isLocation: Boolean,
  
});

const OfflineUser =  mongoose.model('OfflineUser', offlineUserSchema);

module.exports =  OfflineUser;
