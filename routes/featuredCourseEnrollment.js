const express = require('express')
const router = express.Router();
const {createEnrollment} = require("../controllers/featureCourseEnrollment")
router.post('/',createEnrollment)

module.exports = router;