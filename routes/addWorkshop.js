const express = require('express');
const router = express.Router();
const {addWorkshopToUniversity,getUniversityWorkshops,getWorkshops,verifyWorkshopPassword,submitMaterial, getMaterail, downloadMaterial} = require("../controllers/workshopController");
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
// router.delete("/delete/:workshopId",deleteUniversityWorkshop)

module.exports=router