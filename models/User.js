// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['student', 'university'],
    required: [true, 'User type is required'],
  },
  firstName: {
    type: String,
    required: function () { return this.userType === 'student'; },
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
  },
  lastName: {
    type: String,
    required: function () { return this.userType === 'student'; },
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: function () { return this.userType === 'student'; },
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  address: {
    doorNumber: { type: String },
    landmark: { type: String },
    state: { type: String },
    pincode: { type: String, match: [/^\d{6}$/, 'Pincode must be 6 digits'] },
  },
  education: {
    currentEducation: { type: String },
    passingYear: { type: Number },
  },
  universityDetails: {
    universityName: {
      type: String,
      required: function () { return this.userType === 'university'; },
    },
    recognizedBy: {
      type: String,
      required: function () { return this.userType === 'university'; },
    },
    universityAddress: { type: String },
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
