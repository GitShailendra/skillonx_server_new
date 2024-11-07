const express = require('express');
const router = express.Router();
const { registerStudent ,login} = require('../controllers/studentController');

// Route to register a student
router.post('/', registerStudent);
router.post("/login",login)
module.exports = router;
