const express = require('express');
const router = express.Router();
const { registerUniversity ,login,logout,getStudents,getWorkshopRegistrations,clearNotifications} = require('../controllers/universityController');

// Route to register a university
router.post('/', registerUniversity);
router.post("/login",login)
router.post("/logout",logout);
router.get("/get-students/:uniId",getStudents)
router.get("/workshop-registrations/:uniId",getWorkshopRegistrations)
router.post("/clear-notifications/:uniId",clearNotifications)
module.exports = router;
