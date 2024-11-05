const express = require('express');
const router = express.Router();
const { registerUniversity } = require('../controllers/universityController');

// Route to register a university
router.post('/', registerUniversity);

module.exports = router;
