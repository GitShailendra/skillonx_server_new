const express = require("express")

const router = express.Router();
const {increaseReferrel,createUser,uploadResume,saveReferrel} = require("../controllers/OnlineUserrController")
const multer = require("multer");
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage });
router.post("/increase-referral",increaseReferrel)
router.post("/online",createUser)
// Define route for uploading resume
router.post("/upload-resume", upload.single("resume"), uploadResume);
router.post("/save-referral",saveReferrel)
module.exports = router;