// models/Workshop.js
const mongoose = require('mongoose');

const workshopRegistrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'completed', 'cancelled'],
    default: 'registered'
  },
  attendance: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Workshop title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Workshop description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Workshop category is required'],
    enum: ['Web Development', 'English Communication', 'UI/UX Design', 'Version Control', 'Career Development','Aptitude','Programming']
  },
  level: {
    type: String,
    required: [true, 'Workshop level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: String,
    required: [true, 'Workshop duration is required']
  },
 
  mode: {
    type: String,
    required: [true, 'Workshop mode is required'],
    enum: ['On Campus', 'Online Live', 'Hybrid']
  },
  password: {
    type: String,
    required: true
  },
  highlights: [{
    type: String,
    required: [true, 'Workshop highlights are required']
  }],
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  registrations: [workshopRegistrationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Workshop = mongoose.model('Workshop', workshopSchema);
module.exports = Workshop;