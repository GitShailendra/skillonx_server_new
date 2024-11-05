const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    minlength: [6, 'Password must be at least 6 characters']
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
