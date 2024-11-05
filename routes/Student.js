const express = require('express');
const router = express.Router();
const { registerStudent } = require('../controllers/studentController');

// Route to register a student
router.post('/', registerStudent);

module.exports = router;
