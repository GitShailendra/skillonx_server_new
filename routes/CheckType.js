// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginController } = require('../controllers/authController');

// POST /check-type - Login route
router.post('/', loginController);

module.exports = router;
