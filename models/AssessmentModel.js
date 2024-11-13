// assessmentModel.js
const mongoose = require('mongoose');

// Question Schema
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(options) {
        return options.length === 4;
      },
      message: 'Each question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer is required'],
    min: 0,
    max: 3
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required']
  }
});

// Assessment Schema
const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  questions: {
    type: [questionSchema],
    required: [true, 'At least one question is required'],
    validate: {
      validator: function(questions) {
        return questions.length > 0;
      },
      message: 'Assessment must have at least one question'
    }
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  workshop:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Workshop"
  }
}, { timestamps: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;