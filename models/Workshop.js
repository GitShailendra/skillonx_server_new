// Backend: models/Workshop.js
const mongoose = require('mongoose');

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
    enum: ['Web Development', 'English Communication', 'UI/UX Design', 'Version Control', 'Career Development']
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
  batchSize: {
    type: String,
    required: [true, 'Batch size is required']
  },
  mode: {
    type: String,
    required: [true, 'Workshop mode is required'],
    enum: ['On Campus', 'Online Live', 'Hybrid']
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Workshop = mongoose.model('Workshop', workshopSchema);
module.exports = Workshop;