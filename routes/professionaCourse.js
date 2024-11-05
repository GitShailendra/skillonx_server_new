const express = require('express')
const router = express.Router();
const {createProfessionalEnrollment} = require("../controllers/professionalCourse")
router.post('/',createProfessionalEnrollment)

module.exports = router;