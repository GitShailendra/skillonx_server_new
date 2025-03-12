const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HackathonParticipantSchema = new Schema({

  // Account Information
  userType: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  institution: {
    type: String,
    required: true,
    trim: true
  },
  idCard: {
    data: Buffer,
    contentType: String,
    fileName: String,
    fileSize: Number
  },
  
  // Team Information
  teamType: {
    type: String,
    enum: ['individual', 'team'],
    default: 'individual'
  },
  teamName: {
    type: String,
    trim: true,
    required: function() {
      return this.teamType === 'team';
    }
  },
  memberCount: {
    type: Number,
    min: 1,
    max: 4,
    default: 1,
    required: function() {
      return this.teamType === 'team';
    }
  },
  
  // Proposal Information
  domain: {
    type: String,
    enum: ['Artificial Intelligence', 'Web Development', 'Open Innovation'],
    required: true
  },
  proposalFile: {
    data: Buffer,
    contentType: String,
    fileName: String,
    fileSize: Number
  },
  isProposal:{
      type:Boolean,
      default:false
  },
  // Application Status 
  applicationStatus: {
    type: String,
    enum: ['pending_proposal','pending', 'under_review', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  reviewerNotes: String,
  reviewDate: Date,
  
  // For shortlisted applications
  shortlistedDate: Date,
  acceptanceNotificationSent: {
    type: Boolean,
    default: false
  },
  
  // For rejected applications
  rejectedDate: Date,
  rejectionReason: String,
  rejectionNotificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Add methods to the schema as needed
HackathonParticipantSchema.methods.updateStatus = function(newStatus, reviewerNotes) {
  this.applicationStatus = newStatus;
  
  if (newStatus === 'shortlisted') {
    this.shortlistedDate = new Date();
  } else if (newStatus === 'rejected') {
    this.rejectedDate = new Date();
    this.rejectionReason = reviewerNotes;
  }
  
  this.reviewDate = new Date();
  this.reviewerNotes = reviewerNotes;
  
  return this.save();
};

const HackathonParticipant = mongoose.model('HackathonParticipant', HackathonParticipantSchema);

module.exports = HackathonParticipant;