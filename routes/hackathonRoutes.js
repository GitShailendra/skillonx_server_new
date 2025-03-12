const express = require('express');

const router = express.Router();
const {register, login, getParticipantDetails,createAdminHackathon, adminLogin,getAllApplications,updateApplicationStatus, submitProposal,getProposalStatus,downloadFile} = require('../controllers/hackathonController');
const {protectHackathonParticipant,protectHackathonManager} = require('../middlewares/authMiddleware')
const multer = require("multer");
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage });
//admin routes login signup
router.post('/create',createAdminHackathon);
router.post('/admin-login',adminLogin)

//hackathon user login signup routes 
router.post('/register',register)
router.post('/login',login)
router.get('/participant-details',protectHackathonParticipant,getParticipantDetails);
router.post('/submit-proposal', protectHackathonParticipant, submitProposal);
router.get('/proposal-status',protectHackathonParticipant,getProposalStatus)
//hackathon manager
router.get('/applications', protectHackathonManager, getAllApplications);
router.put('/application-status/:id', protectHackathonManager, updateApplicationStatus);
router.get('/download-file/:id/:fileType', protectHackathonManager, downloadFile);
module.exports = router;