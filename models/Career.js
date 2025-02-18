const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    resume: {
      data: Buffer,
      contentType: String
    },
    coverLetter: {
      type: String,
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('Application', applicationSchema);
