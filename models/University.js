const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  universityName: {
    type: String,
    required: [true, 'University name is required'],
    minlength: [2, 'University name must be at least 2 characters'],
    maxlength: [100, 'University name cannot exceed 100 characters']
  },
  recognizedBy: {
    type: String,
    required: [true, 'Recognition (e.g., UGC, AICTE) is required'],
    // enum: ['UGC', 'AICTE', 'NAAC', 'NBA'] // Example recognitions; adjust as necessary
  },
  universityAddress: {
    type: String,
    required: [true, 'University address is required'],
    minlength: [10, 'Address must be at least 10 characters'],
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
    minlength: [6, 'Password must be at least 6 characters']
  }
}, { timestamps: true });

module.exports = mongoose.model('University', universitySchema);
