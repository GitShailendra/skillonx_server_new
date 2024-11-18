const express = require('express');
const router = express.Router();
const {addAssessmentToUniversity,getAssesments,getAssessmentsStudent} = require("../controllers/assessmentController")

router.post("/add",addAssessmentToUniversity)
router.get("/university/:universityId",getAssesments)
router.get("/get-assessment/:studId",getAssessmentsStudent)
// router.post("/submit",submitAssessment)
module.exports = router