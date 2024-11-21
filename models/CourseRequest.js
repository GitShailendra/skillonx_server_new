// models/CourseRequest.js
const mongoose = require('mongoose');

const courseRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  // Instead of referencing a Course model, we'll include course details directly
  courseDetails: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    hasInternship: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  adminComment: String
});

module.exports = mongoose.model('CourseRequest', courseRequestSchema);
