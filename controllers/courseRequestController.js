const { request } = require('express');
const CourseRequest = require('../models/CourseRequest');
const Student = require('../models/Student')
// Student submits course request
exports.submitCourseRequest = async (req, res) => {
  try {
    const studentId = req.body.studentId; // Assuming you have auth middleware
    const courseDetails = req.body;

    // Check if student already has a pending or approved request for this course
    const existingRequest = await CourseRequest.findOne({
      studentId,
      'courseDetails.title': courseDetails.title,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested or enrolled in this course'
      });
    }

    // Create new request
    const courseRequest = await CourseRequest.create({
      studentId,
      courseDetails,
      status: 'pending'
    });
    console.log(courseRequest._id)
    res.status(201).json({
      success: true,
      data: courseRequest
    });

  } catch (error) {
    console.error('Error in submitCourseRequest:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting course request'
    });
  }
};
// Get all requests for a student
exports.getStudentRequests = async (req, res) => {
    try {
      const {studentId} = req.params;
      // console.log(studentId)
      // Fetch all requests and sort by status and date
      const requests = await CourseRequest.find({ studentId })
        .sort({ requestDate: -1 });
        const student = await Student.findById(studentId)
    
        
    
        if (!student) {
          return res.status(404).json({
            success: false,
            message: 'Student not found'
          });
        }
    
        // Get all request IDs
        const requestIds = requests.map(request => request._id);
    
        // Update student with request IDs
       const stu =  await Student.findByIdAndUpdate(
          studentId,
          { 
            $addToSet: { // $addToSet ensures no duplicates
              courseRequest: { $each: requestIds }
            }
          },
          { new: true }
        );
        console.log(stu)
      // Separate requests by status
      const pendingRequests = requests.filter(req => req.status === 'pending');
      const approvedRequests = requests.filter(req => req.status === 'approved');
      const rejectedRequests = requests.filter(req => req.status === 'rejected');
      // const updatedStudent = await Student.findByIdAndUpdate({ courseRequest:request._id})
      res.status(200).json({
        success: true,
        data: {
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests
        }
      });
  
    } catch (error) {
      console.error('Error in getStudentRequests:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Admin: Get all pending requests
  exports.getPendingRequests = async (req, res) => {
    try {
      const requests = await CourseRequest.find({ status: 'pending' })
        .populate('studentId', 'firstName email')
        .sort('-requestDate');
        console.log(requests)
      res.status(200).json({
        success: true,
        data: requests
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Admin: Update request status
  exports.updateRequestStatus = async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, adminComment } = req.body;
  
      const request = await CourseRequest.findById(requestId);
  
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }
  
      request.status = status;
      request.adminComment = adminComment;
      
      if (status === 'approved') {
        request.approvalDate = Date.now();
      }
  
      await request.save();
  
      res.status(200).json({
        success: true,
        data: request
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };