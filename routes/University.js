const express = require('express');
const router = express.Router();
const { registerUniversity ,login,logout} = require('../controllers/universityController');

// Route to register a university
router.post('/', registerUniversity);
router.post("/login",login)
router.post("/logout",logout)

module.exports = router;
