// routes/courseRequestRoutes.js
const express = require('express');
const router = express.Router();
const { 
  submitCourseRequest, 
  getPendingRequests,
  updateRequestStatus,
  getStudentRequests
  
} = require('../controllers/courseRequestController');

router.post('/submit', submitCourseRequest);
router.get('/student-requests/:studentId', getStudentRequests);
router.get('/pending', getPendingRequests);
router.put('/:requestId/status', updateRequestStatus);

module.exports = router;