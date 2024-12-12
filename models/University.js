// models/University.js
const mongoose = require('mongoose');

const universityWorkshopRegistrationSchema = new mongoose.Schema({
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true
  },
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
  }, isRead: {  // Added this field
    type: Boolean,
    default: false
  }
}, { _id: false });

const universitySchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
  },
  universityName: {
    type: String,
    required: [true, 'University name is required'],
    minlength: [2, 'University name must be at least 2 characters'],
    maxlength: [100, 'University name cannot exceed 100 characters']
  },
  recognizedBy: {
    type: String,
    required: [true, 'Recognition (e.g., UGC, AICTE) is required'],
  },
  universityAddress: {
    type: String,
    required: [true, 'University address is required'],
    minlength: [5, 'Address must be at least 10 characters'],
    maxlength: [300, 'Address cannot exceed 300 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    // Remove the match validation from here
    // select: false  // Don't return password in queries by default
  },
  verificationCode: {
    type: String,
    select: false // Don't return this field in queries
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  workshops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
  }],
  materialId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
  },
  workshopRegistrations: [universityWorkshopRegistrationSchema],
  assessments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    
  }],
  isApproved: { type: Boolean, default: false },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalRemarks: String,
  approvalDate: Date,
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  termsAndConditions: {
    accepted: {
      type: Boolean,
      required: true,
      default: false
    },
    acceptedDate: {
      type: Date,
      required: true
    },
    version: {
      type: String,
      default: '1.0'
    }
  }
  
}, { timestamps: true });

module.exports = mongoose.model('University', universitySchema);