const express = require('express');
const router = express.Router();
const { registerStudent ,login,logout,registerWorkshop,submitAssessment,getStudent,updateStudent,getDashboardData,verifyEmail,getRanks,getStudentDetail,getUniversityLeaderboard} = require('../controllers/studentController');
const { 
    studentForgotPassword, 
    studentResetPassword ,
    studentResendResetCode
  } = require('../controllers/passwordController');
  
// Route to register a student
router.post('/', registerStudent);
router.post("/register-workshop",registerWorkshop)
router.post('/verify-email',verifyEmail);
router.post('/forgot-password', studentForgotPassword);
router.post('/reset-password', studentResetPassword);
router.post('/resend-reset-code', studentResendResetCode);
router.post('/submit/:stuId',submitAssessment)
router.get('/profile/:stuId',getStudent)
router.put("/profile/:stuId",updateStudent)
router.get('/dashboard/:studentId',getDashboardData)
router.get('/rankings/:uniId',getRanks)
router.get('/detail/:studentId', getStudentDetail);
router.get('/leaderboard', getUniversityLeaderboard);

router.post('/login',login);
router.post("/logout",logout)
// router.post("/login",login)
module.exports = router;
