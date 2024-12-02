const express = require('express');
const router = express.Router();
const { registerUniversity ,login,logout,getStudents,getWorkshopRegistrations,clearNotifications,getdashboardData,getName,verifyEmail, updateProfile,getProfile} = require('../controllers/universityController');
const { 
    universityForgotPassword, 
    universityResetPassword ,
    universityResendResetCode
  } = require('../controllers/passwordController');
// Route to register a university
router.post('/', registerUniversity);
router.post('/verify-email',verifyEmail)
router.get('/get-name',getName)
router.post('/forgot-password', universityForgotPassword);
router.post('/reset-password', universityResetPassword);
router.post('/resend-reset-code', universityResendResetCode);


router.post("/login",login)
router.get('/dashboard/:uniId',getdashboardData)
router.post("/logout",logout);
router.get("/get-students/:uniId",getStudents)
router.get("/workshop-registrations/:uniId",getWorkshopRegistrations)
router.post("/clear-notifications/:uniId",clearNotifications)
router.get("/profile/:id",getProfile)
router.put('/profile/:id',updateProfile)
module.exports = router;
