// config/db.js
const mongoose = require('mongoose');
const Question = require("../models/Question")
const questionsData = require("../init/pythonQuestion")
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL;
        
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI defined:', !!mongoURI);
        
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        await mongoose
        .connect(mongoURI, {
          
        })
        
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
