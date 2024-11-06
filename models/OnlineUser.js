const mongoose = require("mongoose");

const onlineUserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  isStudent: Boolean,
  isLocation: Boolean,
  referralCode: {
    type: String,
    // unique: true, // Each user has a unique referral code
  },
  referralCount: {
    type: Number,
    default: 0, // Tracks how many people used this user's referral code
  },
  referrelFormSubmitted:{
    type:Number,
    default:0,
  }
  
});

module.exports = mongoose.model("OnlineUser", onlineUserSchema);
