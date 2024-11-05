const express = require('express')
const router = express.Router();
const {createSchedule} = require('../controllers/scheduleConsultation')
router.post('/',createSchedule)

module.exports = router