// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { createAdmin, loginAdmin,logout,getUniversities,deleteUniversity,getStudents,getDashboard,getPendingUniversities,updateUniversityApproval, getStudentById, getStudentsWithAccess, deleteCourseAccess,messageController} = require('../controllers/adminController');
const {verifyToken} = require('../middlewares/adminMiddleware');

// Setup route - should be disabled after initial setup
router.post('/create', createAdmin);
router.get('/pending-universities', verifyToken,  getPendingUniversities);
router.patch('/university-approval/:universityId', verifyToken, updateUniversityApproval);
router.post('/send-welcome-messages',messageController)
// Login route
router.post('/login', loginAdmin);
router.get('/universities',verifyToken,getUniversities);
router.get('/students',verifyToken,getStudents);
router.get("/students/:id",verifyToken,getStudentById)
router.get('/students-with-access',verifyToken,getStudentsWithAccess)
router.get('/dashboard',verifyToken,getDashboard)
router.delete('/universities/:id',verifyToken, deleteUniversity);
router.delete('/course-access/:studentId/:courseRequestId', verifyToken, deleteCourseAccess);


router.post('/logout',logout)
module.exports = router;