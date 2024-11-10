const express = require('express');
const router = express.Router();
const { registerStudent ,login,logout} = require('../controllers/studentController');

// Route to register a student
router.post('/', registerStudent);
router.post('/login',login);
router.post("/logout",logout)
// router.post("/login",login)
module.exports = router;
