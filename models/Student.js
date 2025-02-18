const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userType:{
    type:String,
    required:true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other'] // Ensures gender is one of these values
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
    default: true
  },
  address: {
    doorNumber: {
      type: String,
      required: [true, 'Door number is required']
    },
    landmark: {
      type: String,
      required: [true, 'Landmark is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
    },
    
  },
  universityName: {
    type: String,
    required: [true, 'University name is required'],
    minlength: [2, 'University name must be at least 2 characters'],
    maxlength: [100, 'University name cannot exceed 100 characters']
  },
  currentEducation: {
    type: String,
    required: [true, 'Current education is required'],
    minlength: [2, 'Education field must be at least 2 characters']
  },
  passingYear: {
    type: Number,
    required: [true, 'Passing year is required'],
    min: [1900, 'Passing year must be after 1900'],
    max: [new Date().getFullYear() + 10, 'Passing year cannot be more than 10 years from the current year']
  },
  devices: [{
    userAgent: String,
    ip: String,
    timestamp: Date,
    platform: String,
    browser: String
  }],
  workshops:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
  }],
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  assessmentResults: [{
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'submitted'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    answers: [{
      questionIndex: {
        type: Number,
        required: true
      },
      selectedOption: {
        type: Number,
        required: true
      }
    }],
    score: {
      obtainedMarks: {
        type: Number,
        required: true
      },
      totalMarks: {
        type: Number,
        required: true
      },
      percentage: {
        type: Number,
        required: true
      }
    }
  }],
  universityId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
  },
  courseRequest:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'CourseRequest'
  }],
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
      default: '1.0' // You can update this when you make significant changes to your terms
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
