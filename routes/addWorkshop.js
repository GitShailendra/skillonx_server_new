const express = require('express');
const router = express.Router();
const {addWorkshopToUniversity,getUniversityWorkshops,getWorkshops,verifyWorkshopPassword,submitMaterial, getMaterail, downloadMaterial,toggleAttendance,markAttendance} = require("../controllers/workshopController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage });
router.post("/add",addWorkshopToUniversity)
router.post('/materials',upload.single('file'),submitMaterial)
router.get("/:workshopId/materials",getMaterail)
router.get('/materials/:materialId/download',downloadMaterial)
router.post("/verify-password",verifyWorkshopPassword)
router.get("/university/:universityId",getUniversityWorkshops)
router.get("/get-workshops/:studentId",getWorkshops)
router.patch("/:workshopId/toggle-attendance",toggleAttendance)
router.patch("/:workshopId/mark-attendance",markAttendance)
// router.delete("/delete/:workshopId",deleteUniversityWorkshop)

module.exports=router