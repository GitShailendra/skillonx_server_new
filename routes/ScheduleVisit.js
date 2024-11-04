const express = require("express")
const router = express.Router();
const {createScheduleVisit} = require("../controllers/ScheduleVisit")

router.post("/",createScheduleVisit)

module.exports = router;