// config/db.js
const mongoose = require('mongoose');
const Question = require("../models/Question")
const questionsData = require("../init/pythonQuestion")
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Question.deleteMany({ category: 'Python' });

    // Insert new questions
    await Question.insertMany(questionsData);
    console.log(`MongoDB Connected:`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
