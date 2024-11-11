const express = require('express');
const router = express.Router();
const {addWorkshopToUniversity,getUniversityWorkshops,getWorkshops} = require("../controllers/workshopController")
router.post("/add",addWorkshopToUniversity)
router.get("/university/:universityId",getUniversityWorkshops)
router.get("/get-workshops/:studentId",getWorkshops)
// router.delete("/delete/:workshopId",deleteUniversityWorkshop)

module.exports=router