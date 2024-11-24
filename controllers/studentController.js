const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Workshop = require("../models/Workshop")
const University = require("../models/University")
const Assessment  =require("../models/AssessmentModel")
const {generateToken} = require("../utils/generateToken")
const CourseRequest = require("../models/CourseRequest");
const { sendVerificationEmail } = require('../config/emailConfig');
// Controller for registering a student
exports.registerStudent = async (req, res) => {
  try {
    // Check if user already exists
    const existingStudent = await Student.findOne({ email: req.body.email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Generate a random verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    // Create new student (unverified)
    const student = new Student({
      ...req.body,
      password: hashedPassword,
      verificationCode,
      isVerified: false, // Set to false initially
      termsAndConditions: {
        accepted: req.body.termsAndConditions.accepted,
        acceptedDate: new Date(req.body.termsAndConditions.acceptedDate),
        version: req.body.termsAndConditions.version || '1.0'
      }
    });

    // Save the student
    await student.save();

    // If the university exists, associate the student with it
    const { universityName } = req.body;
    const universityStu = await University.findOne({ universityName });
    if (universityStu) {
      await University.findOneAndUpdate(
        { universityName },
        { $push: { students: student._id } },
        { new: true }
      );
    }

    // Send the verification email
    await sendVerificationEmail(req.body.email, verificationCode);

    res.status(201).json({
      message: 'Student registered successfully. Please verify your email to continue.',
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred while registering the student' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Find the user with the provided email and verification code
    const student = await Student.findOne({ email, verificationCode });
    if (!student) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark the user as verified
    student.isVerified = true;
    student.verificationCode = null; // Clear the verification code
    await student.save();

    // Generate token
    const token = generateToken(student);

    // Set cookie and send response
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: { ...student.toObject(), password: undefined }, // Exclude password from response
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'An error occurred during email verification' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if (!student.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(student);

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    // Set cookie and send response
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      message: 'Login successful',
      token,
      user: studentResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.verifyToken = async (req, res) => {
  try {
    // req.user is already set by the protect middleware
    res.json({ user: req.user });
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
};

exports.registerWorkshop = async (req, res) => {
  try {
    const { workshopId, studentId, workshopTitle, workshopDate, workshopVenue } = req.body;
    
    // Check if student exists and get university info
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Check for existing registration
    if (student.workshops.includes(workshopId)) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already registered for this workshop'
      });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update student's workshops array
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $push: { workshops: workshopId } },
        { new: true, session }
      );

      // Update workshop's registrations
      await Workshop.findByIdAndUpdate(
        workshopId,
        {
          $push: {
            registrations: {
              student: studentId,
              registrationDate: new Date(),
              status: 'registered'
            }
          }
        },
        { session }
      );

      // Update university's registrations
      await University.findOneAndUpdate(
        { universityName: student.universityName },
        {
          $push: {
            workshopRegistrations: {
              workshop: workshopId,
              student: studentId,
              registrationDate: new Date(),
              status: 'registered'
            }
          }
        },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      res.status(201).json({
        status: 'success',
        data: updatedStudent
      });

    } catch (error) {
      // If there's an error, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Workshop registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
exports.submitAssessment = async (req,res)=>{
  
    try {
        const { assessmentId, answers, score } = req.body;
        const studentId = req.params.stuId;

        // First check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Student not found'
            });
        }

        // Check if assessment exists
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({
                status: 'error',
                message: 'Assessment not found'
            });
        }

        // Check if student is enrolled in the workshop associated with this assessment
        const assessments = await Assessment.findById(assessmentId)
            .populate('workshop'); // Assuming your Assessment model has workshopId field
            
        if (!assessments) {
            return res.status(404).json({
                status: 'error',
                message: 'Assessment not found'
            });
        }

        // Check if student has already submitted this assessment
        const existingSubmission = student.assessmentResults.find(
            result => result.assessmentId.equals(assessmentId)
        );

        if (existingSubmission) {
            return res.status(400).json({
                status: 'error',
                message: 'You have already submitted this assessment',
                submissionDate: existingSubmission.submittedAt,
                score: existingSubmission.score
            });
        }

        // Validate that all questions are answered
        const expectedQuestionCount = assessment.questions.length;
        if (answers.length !== expectedQuestionCount) {
            return res.status(400).json({
                status: 'error',
                message: `Please answer all questions. Expected ${expectedQuestionCount} answers, received ${answers.length}`
            });
        }

        // Validate answers format
        const isValidAnswers = answers.every(answer => 
            typeof answer.questionIndex === 'number' && 
            typeof answer.selectedOption === 'number' &&
            answer.questionIndex >= 0 &&
            answer.questionIndex < expectedQuestionCount &&
            answer.selectedOption >= 0 &&
            answer.selectedOption < assessment.questions[answer.questionIndex].options.length
        );

        if (!isValidAnswers) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid answer format'
            });
        }

        // Create new assessment result
        const newAssessmentResult = {
            assessmentId,
            status: 'submitted',
            submittedAt: new Date(),
            answers,
            score: {
                obtainedMarks: score.obtainedMarks,
                totalMarks: score.totalMarks,
                percentage: score.percentage
            }
        };

        // Add the new assessment result to student's assessmentResults array
        student.assessmentResults.push(newAssessmentResult);

        // Save the updated student document
        await student.save();

        // Log submission for monitoring
        console.log(`Assessment submitted - Student: ${studentId}, Assessment: ${assessmentId}, Score: ${score.percentage}%`);

        return res.status(200).json({
            status: 'success',
            message: 'Assessment submitted successfully',
            data: {
                submissionDate: newAssessmentResult.submittedAt,
                score: newAssessmentResult.score
            }
        });

    } catch (error) {
        console.error('Assessment submission error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error while submitting assessment',
            error: error.message
        });
    }
  
}

exports.getStudent = async (req,res)=>{
  try{
    const {stuId} = req.params
    const student = await Student.findById(stuId)
    res.status(200).json({
      status: 'success',
      data: student,
      message:"Student Data Fetched Successfully"
    })
  }catch(error){
    console.log(error)
    res.status(500).json({
      status:"error",
      message:"Error fetching student data",
    })  

  }
}
exports.updateStudent = async (req,res)=>{
  try{
    const { stuId } = req.params
    const updatedFields = req.body
    console.log(updatedFields)

    // Validate if student exists
    const existingStudent = await Student.findById(stuId)
    if (!existingStudent) {
      return res.status(404).json({
        status: "error",
        message: "Student not found"
      })
    }

    // Update student with new data
    const updatedStudent = await Student.findByIdAndUpdate(
      stuId,
      { $set: updatedFields },
      { 
        new: true,        // Return the updated document
        runValidators: true // Run model validators on update
      }
    )

    res.status(200).json({
      status: "success",
      data: updatedStudent,
      message: "Student profile updated successfully"
    })

  }catch(error){
    console.log(error)
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: "error",
        message: "Validation Error",
        errors: Object.values(error.errors).map(err => err.message)
      })
    }

    // Handle general errors
    res.status(500).json({
      status: "error",
      message: "Error updating student profile"
    })
  }
}

exports.getDashboardData = async (req,res)=>{
  try {
    const {studentId} = req.params
    // const student = await Student.findById(studentId).populate('Workshop').populate('Assessment').populate('CourseRequest')
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Count workshops where this student is registered
    const workshopCount = await Workshop.countDocuments({
      'registrations.student': studentId
    });
    const courseRequests = await CourseRequest.find({ studentId });

    // Count requests by status
    const courseRequestCounts = {
      total: courseRequests.length,
      pending: courseRequests.filter(req => req.status === 'pending').length,
      approved: courseRequests.filter(req => req.status === 'approved').length,
      rejected: courseRequests.filter(req => req.status === 'rejected').length
    };
    const assessmentCount = student.assessmentResults?.length || 0;
    const courseRequestDetails = courseRequests.map(request => ({
      id: request._id,
      title: request.courseDetails.title,
      category: request.courseDetails.category,
      status: request.status,
      requestDate: request.requestDate,
      approvalDate: request.approvalDate
    }));
    const workshop = await Workshop.find({
      'registrations.student': studentId
    });
    
    console.log(courseRequestDetails," coruse details")
    console.log('Student ID:', studentId);
    console.log('Course Request Counts:', courseRequestCounts);
    console.log('Workshop Count:', workshopCount);
    console.log('Assessment Count:', assessmentCount);
    console.log(workshop)
    res.status(200).json({
      status: 'success',
      data: {
        courseRequestDetails,
        courseRequestCounts,
        workshopCount,
        assessmentCount,
        workshop
      }
    });

  } catch (error) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
}