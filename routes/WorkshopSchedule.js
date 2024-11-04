const express = require('express');
const router = express.Router();
const {createWorkshopSchedule,createWorkshopEnrollment,createConsultation,createCallbackRequest} = require("../controllers/WorkshopScheduleController")
router.post("/",createWorkshopSchedule)
router.post("/workshop-enrollment",createWorkshopEnrollment)
router.post("/consultation",createConsultation)
router.post("/request-callback",createCallbackRequest)
module.exports = router