// routes/questions.js
const express = require('express');
const Question = require('../models/Question');
const router = express.Router();

router.get('/python-test', async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $match: { category: 'Python' } },
      { $sample: { size: 15 } } // Fetch 15 random questions
    ]);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

module.exports = router;
