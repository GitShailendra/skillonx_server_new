const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Workshop = require("../models/Workshop")
const University = require("../models/University")
const Assessment  =require("../models/AssessmentModel")
const {generateToken} = require("../utils/generateToken")
const CourseRequest = require("../models/CourseRequest");
const { sendVerificationEmail, sendEmail } = require('../config/emailConfig');
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
    await sendVerificationEmail(req.body.email, verificationCode,req.body.userType);

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
    console.error('erorr while resgistering',error);
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
    // const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    // const logoPath = `/images/primaryLogo.png`;
    // const absoluteLogoUrl = `${serverUrl}${logoPath}`;
    // <!-- Test with absolute URL -->
    //             <img src="/images/primaryLogo.png" 
    //                  alt="SkillonX Logo" 
    //                  style="width: 80px; height: 80px; margin-bottom: 20px;"
    //                  onerror="this.onerror=null; this.src='https://via.placeholder.com/80'; console.log('Logo failed to load');"></img>
    // console.log('Debug - Logo URL:', absoluteLogoUrl);
    const template = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--[if mso]>
        <noscript>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        </noscript>
        <![endif]-->
        <style type="text/css">
            /* Reset styles */
            body, #bodyTable { margin:0; padding:0; width:100% !important; }
            img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
            table { border-collapse:collapse !important; }
            
            /* iOS BLUE LINKS */
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }

            /* Mobile styles */
            @media screen and (max-width: 600px) {
                .mobile-padding {
                    padding-left: 5% !important;
                    padding-right: 5% !important;
                }
                
                .responsive-table {
                    width: 100% !important;
                }

                .mobile-text-center {
                    text-align: center !important;
                }

                .mobile-image {
                    height: auto !important;
                    max-width: 100% !important;
                    width: 100% !important;
                }
            }
        </style>
    </head>
    <body style="margin: 0 !important; padding: 0 !important; background: #f8f9fa;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
                <td align="center" style="padding: 20px 0px;">
                    <!-- Email Container -->
                    <table class="responsive-table" border="0" cellpadding="0" cellspacing="0" width="600" style="background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #2193b0, #6dd5ed); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                                
                                <h1 style="color: #ffffff; margin: 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 28px; font-weight: 600;">Welcome to Skillonx!</h1>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td class="mobile-padding" style="padding: 40px 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="color: #333333; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 20px;">
                                            Dear ${student.firstName || 'Student'},
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #333333; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 30px;">
                                            🎉 Congratulations! Your Skillonx account has been successfully created. You're now part of a community dedicated to continuous learning and professional growth.
                                        </td>
                                    </tr>

                                    <!-- Account Details -->
                                    <tr>
                                        <td style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #2193b0; margin: 30px 0;">
                                            <h3 style="color: #2193b0; margin: 0 0 15px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px;">Account Details</h3>
                                            <p style="margin: 0; color: #555555; font-family: 'Segoe UI', Arial, sans-serif;">
                                                <strong>Account Created:</strong> ${new Date(student.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Security Tips -->
                                    <tr>
                                        <td style="padding-top: 30px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff8f3; padding: 25px; border-radius: 8px; border: 1px solid #ffe4d1;">
                                                <tr>
                                                    <td>
                                                        <h3 style="color: #ff7f50; margin: 0 0 15px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px;">🔒 Security Best Practices</h3>
                                                        <ul style="margin: 0; padding-left: 20px; color: #666666; font-family: 'Segoe UI', Arial, sans-serif;">
                                                            <li style="margin-bottom: 10px;">Create a strong, unique password</li>
                                                            <li style="margin-bottom: 10px;">Enable two-factor authentication</li>
                                                            <li style="margin-bottom: 10px;">Never share your credentials</li>
                                                            <li style="margin-bottom: 0;">Log out from shared devices</li>
                                                        </ul>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Get Started Boxes -->
                                    <tr>
                                        <td style="padding-top: 30px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; padding: 25px; border-radius: 8px;">
                                                <tr>
                                                    <td>
                                                        <h3 style="color: #2193b0; margin: 0 0 20px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px;">🚀 Get Started</h3>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td class="mobile-text-center" width="33%" style="padding: 10px;">
                                                                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                                                                        <div style="font-size: 24px; margin-bottom: 10px;">👤</div>
                                                                        <div style="color: #444444; font-weight: 500; font-family: 'Segoe UI', Arial, sans-serif;">Complete Profile</div>
                                                                    </div>
                                                                </td>
                                                                <td class="mobile-text-center" width="33%" style="padding: 10px;">
                                                                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                                                                        <div style="font-size: 24px; margin-bottom: 10px;">📚</div>
                                                                        <div style="color: #444444; font-weight: 500; font-family: 'Segoe UI', Arial, sans-serif;">Browse Courses</div>
                                                                    </div>
                                                                </td>
                                                                <td class="mobile-text-center" width="33%" style="padding: 10px;">
                                                                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                                                                        <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
                                                                        <div style="color: #444444; font-weight: 500; font-family: 'Segoe UI', Arial, sans-serif;">Join Workshops</div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Signature -->
                                    <tr>
                                        <td style="padding-top: 30px; color: #333333; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                                            We're excited to have you on board!<br>
                                            <strong style="color: #2193b0;">The Skillonx Team</strong>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
                                <p style="color: #666666; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 15px 0;">
                                    This is an automated message. Please do not reply to this email.
                                </p>
                                <p style="color: #666666; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0;">
                                    Need help? Contact our support team
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
   const ress=  await sendEmail({
      to: student.email,
      subject: 'New Login Detected - Skillonx Account',
      html: template
    });
    console.log("email send successfully ", ress)
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

    // Get device and location information
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    };

    // Check if this is a new device
    const isNewDevice = !student.devices?.some(device => 
      device.userAgent === deviceInfo.userAgent && device.ip === deviceInfo.ip
    );

    if (isNewDevice) {
      // Update student's devices array
      if (!student.devices) student.devices = [];
      student.devices.push(deviceInfo);
      await student.save();

      // Send new login alert email
      const loginAlertTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ff9800; padding: 20px; text-align: center;">
            <h1 style="color: white;">New Login Alert</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${student.firstName},</p>
            
            <p>We detected a new login to your Skillonx account from a device we haven't seen before.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Login Details</h3>
              <p><strong>Date & Time:</strong> ${deviceInfo.timestamp}</p>
              
              <p><strong>Device:</strong> ${deviceInfo.userAgent}</p>
            </div>

            <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Wasn't you?</strong></p>
              <p>If you don't recognize this login activity, please:</p>
              <ol>
                <li>Change your password immediately</li>
                <li>Enable two-factor authentication</li>
                <li>Contact our support team</li>
              </ol>
            </div>

            <p style="margin-top: 20px;">Best regards,<br>The Skillonx Security Team</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
            <p>This is an automated security alert. Please do not reply to this email.</p>
            <p>If you need assistance, please contact our support team.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: student.email,
        subject: 'New Login Detected - Skillonx Account',
        html: loginAlertTemplate
      });
    }

    // Generate token
    const token = generateToken(student);

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;
    console.log(student)
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
      user: studentResponse,
      
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
    const { workshopId, studentId, workshopTitle, workshopDate, location } = req.body;
    console.log(workshopDate,'=-----and------',location)
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
      const formattedDate = new Date(workshopDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log('----------',formattedDate,'-------')
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #0d6efd;">Workshop Registration Confirmation</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${student.firstName || 'Student'},</p>
            
            <p>Your registration for the following workshop has been confirmed:</p>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0;">
               <h3 style="color: #495057; margin-top: 0;">${workshopTitle}</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
            </div>
            
            <div style="background-color: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Important Information:</strong></p>
              <ul style="margin-top: 10px;">
                <li>Please arrive 10 minutes before the workshop starts</li>
                <li>Bring your student ID for verification</li>
                <li>Have any required materials ready</li>
              </ul>
            </div>

            <p style="margin-top: 20px;">Best regards,<br>The Skillonx Team</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
            <p>If you need any assistance, please contact our support team.</p>
          </div>
        </div>
      `;
      const ress = await sendEmail({
        to: student.email,
        subject: `Workshop Registration Confirmation - ${workshopTitle}`,
        html: emailTemplate
      });
      console.log(ress)
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
    console.log(student)
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
      },
      data2:student
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
exports.getRanks = async (req,res)=>{
  const universityId = req.params.uniId
  const university = await University.findById(universityId);

  try {
    const student = await Student.find({
      universityName:university.universityName 
    })
    console.log(student)
    res.status(200).json({
      status: 'success',
      data: student
    })
  } catch (error) {
    console.log(error)
  }
}


exports.getStudentDetail = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student data with populated workshop and assessment references
    const student = await Student.findById(studentId)
      .select('-password -verificationCode -devices')
      .lean();

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Calculate overall performance metrics
    const assessmentResults = student.assessmentResults || [];
    const workshopCount = student.workshops?.length || 0;

    // Calculate overall score from assessment results
    let overallScore = 0;
    if (assessmentResults.length > 0) {
      const totalScore = assessmentResults.reduce((sum, result) => {
        return sum + (result.score?.obtainedMarks / result.score?.totalMarks * 100 || 0);
      }, 0);
      overallScore = totalScore / assessmentResults.length;
    }

    // Get workshop details
    const workshopDetails = await Workshop.find({
      _id: { $in: student.workshops }
    }).select('title startDate duration status completed registrations');
    console.log(workshopDetails[0].startDate.toLocaleDateString())
    // Get recent assessment details
    const recentAssessments = await Promise.all(
      assessmentResults.slice(-5).map(async (result) => {
        const assessment = await Assessment.findById(result.assessmentId)
          .select('title totalMarks');
        
        return {
          title: assessment?.title || 'Unknown Assessment',
          score: result.score,
          submittedAt: result.submittedAt,
          status: result.status
        };
      })
    );

    // Prepare response data
    const responseData = {
      studentInfo: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        universityName: student.universityName
      },
      performance: {
        overallScore: overallScore.toFixed(2),
        totalAssessments: assessmentResults.length,
        workshopsEnrolled: workshopCount,
        completedWorkshops: workshopDetails.filter(w => w.completed).length
      },
      workshops: workshopDetails.map(workshop => {
        // Find the student's registration for this workshop
        const studentRegistration = workshop.registrations.find(
          reg => reg.student.toString() === studentId
        );
        
        return {
          id: workshop._id,
          title: workshop.title,
          date: workshop.startDate,
          duration: workshop.duration,
          status: workshop.status,
          completed: workshop.completed,
          attendanceCount: studentRegistration?.attendanceCount || 0
        };
      }),
      recentAssessments,
      stats: {
        averageScore: overallScore.toFixed(2),
        highestScore: Math.max(...assessmentResults.map(r => 
          (r.score?.obtainedMarks / r.score?.totalMarks * 100) || 0
        )).toFixed(2),
        totalSubmissions: assessmentResults.length
      }
    };

    res.status(200).json({
      status: 'success',
      data: responseData,
      workshopCount
    });

  } catch (error) {
    console.error('Error fetching student detail:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching student details',
      error: error.message
    });
  }
};

exports.getUniversityLeaderboard = async (req, res) => {
  const { university } = req.query;
  console.log(university)
  // const universityy = await University.findOne(university);

  try {
    const student = await Student.find({
      universityName:university 
    })
    console.log(student)
    res.status(200).json({
      status: 'success',
      data: student
    })
  } catch (error) {
    console.log(error)
  }
};