// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { createAdmin, loginAdmin,logout,getUniversities,deleteUniversity,getStudents,getDashboard} = require('../controllers/adminController');
const {verifyToken} = require('../middlewares/adminMiddleware');

// Setup route - should be disabled after initial setup
router.post('/create', createAdmin);

// Login route
router.post('/login', loginAdmin);
router.get('/universities',verifyToken,getUniversities);
router.get('/students',verifyToken,getStudents);
router.get('/dashboard',getDashboard)
router.delete('/universities/:id',verifyToken, deleteUniversity);


router.post('/logout',logout)
module.exports = router;