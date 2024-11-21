// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  category: { type: String, required: true },
  studentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }
});

module.exports = mongoose.model('Question', questionSchema);
