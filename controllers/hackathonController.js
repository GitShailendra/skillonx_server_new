const HackathonParticipant = require('../models/HackathonParticipant');
const {generateToken} = require('../utils/generateToken');
const ManageHackathon = require('../models/ManageHackathon')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const multer = require('multer');
const {sendHackathonRegistrationEmail,sendHackathonStatusEmail} = require('../config/emailConfig')
const upload = multer({
    // Use memory storage to keep files in buffer
    storage: multer.memoryStorage(),
    
    // File filter for validation
    fileFilter: (req, file, cb) => {
      // Allowed file types
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
      }
    },
    
    // File size limit (10MB)
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  });
  
  // Middleware for multiple file uploads as buffers
  const multiUpload = upload.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'proposalFile', maxCount: 1 }
  ]);
  
  // Registration Controller
 
module.exports.register = async (req, res) => {
  try {
    // Wrap Multer middleware in a promise to handle async operations
    await new Promise((resolve, reject) => {
      multiUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // Multer error (e.g., file too large)
          return reject({
            status: 400,
            message: 'File upload error',
            error: err.message
          });
        } else if (err) {
          // Other errors
          return reject({
            status: 500,
            message: 'Upload error',
            error: err.message
          });
        }
        resolve();
      });
    });

    // Destructure form fields
    const {
      email,
      password,
      fullName,
      contactNumber,
      institution,
      teamType,
      teamName,
      memberCount,
      domain
    } = req.body;

    // Check if user already exists
    const existingUser = await HackathonParticipant.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare file buffer data
    const idCardData = req.files && req.files.idCard ? {
      data: req.files.idCard[0].buffer,
      contentType: req.files.idCard[0].mimetype,
      fileName: req.files.idCard[0].originalname,
      fileSize: req.files.idCard[0].size
    } : null;

    // For proposal file - now optional
    const proposalFileData = req.files && req.files.proposalFile ? {
      data: req.files.proposalFile[0].buffer,
      contentType: req.files.proposalFile[0].mimetype,
      fileName: req.files.proposalFile[0].originalname,
      fileSize: req.files.proposalFile[0].size
    } : null;

    // Set application status based on proposal existence
    const applicationStatus = proposalFileData ? 'pending' : 'pending_proposal';

    // Create new participant
    const newParticipant = new HackathonParticipant({
      email,
      password: hashedPassword,
      fullName,
      contactNumber,
      institution,
      idCard: idCardData,
      teamType,
      teamName: teamType === 'team' ? teamName : undefined,
      memberCount: teamType === 'team' ? memberCount : 1,
      domain,
      proposalFile: proposalFileData,
      isProposal: !!proposalFileData,
      applicationStatus: applicationStatus, // This is different now based on proposal existence
      userType: 'hackathonUser'
    });

    // Save to database
    await newParticipant.save();
    await sendHackathonRegistrationEmail(
      email,
      fullName,
      domain,
      !!proposalFileData // Boolean indicating if proposal was submitted
    );
    // Generate JWT token
    const token = generateToken(newParticipant);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      participant: {
        id: newParticipant._id,
        email: newParticipant.email,
        fullName: newParticipant.fullName,
        applicationStatus: newParticipant.applicationStatus,
        hasProposal: !!proposalFileData
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle different types of errors
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred during registration',
      error: error.error || error.message
    });
  }
};
  // Login Controller for Hackathon Participants
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find the participant by email
    const participant = await HackathonParticipant.findOne({ email });
    
    // Check if participant exists
    if (!participant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, participant.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(participant);

    // Return success response with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      participant: {
        id: participant._id,
        email: participant.email,
        fullName: participant.fullName,
        applicationStatus: participant.applicationStatus,
        userType: participant.userType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message
    });
  }
};
// In your hackathon controller
module.exports.getParticipantDetails = async (req, res) => {
  try {
    // The user is already authenticated via middleware
    const participant = await HackathonParticipant.findById(req.user._id);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    // Return participant details
    return res.status(200).json({
      success: true,
      participant: {
        id: participant._id,
        email: participant.email,
        fullName: participant.fullName,
        contactNumber: participant.contactNumber,
        institution: participant.institution,
        teamType: participant.teamType,
        teamName: participant.teamName,
        memberCount: participant.memberCount,
        domain: participant.domain,
        applicationStatus: participant.applicationStatus,
        createdAt: participant.createdAt,
        userType: participant.userType,
        isProposal:participant.isProposal
      }
    });
  } catch (error) {
    console.error('Error fetching participant details:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching participant details',
      error: error.message
    });
  }
};

module.exports.createAdminHackathon = async (req,res)=>{
  try {
    const { email, password, setupKey } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Log the setup process
    console.log('Starting admin creation process...');
    console.log('Setup key received:', setupKey);
    console.log('Environment setup key:', "this-is-secret");

    // Verify setup key
    if (setupKey !== "this-is-secret") {
        console.log('Setup key verification failed');
        return res.status(401).json({
            success: false,
            message: 'Invalid setup key'
        });
    }

    // Check if admin already exists
    const existingManageAdmin = await ManageHackathon.findOne({ role: 'manageHackathon' });
    if (existingManageAdmin) {
        console.log('existingManageAdmin already exists');
        return res.status(400).json({
            success: false,
            message: 'existingManageAdmin already exists'
        });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const manageAdmin = new ManageHackathon({
        email,
        password: hashedPassword,
        role: 'manageHackathon'
    });

    await manageAdmin.save();
    console.log('manageAdmin created successfully');

    res.status(201).json({
        success: true,
        message: 'manageAdmin created successfully'
    });

} catch (error) {
    console.error('manageAdmin creation error:', error);
    res.status(500).json({
        success: false,
        message: error.message || 'Error creating manageAdmin'
    });
}
}
module.exports.adminLogin = async (req,res)=>{
    try {
        const { email, password } = req.body;

        // Find admin
        const manageAdmin = await ManageHackathon.findOne({ email }).select('+password');
        if (!manageAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log(manageAdmin)
        // Verify password
        const isMatch = await bcrypt.compare(password, manageAdmin.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create token
        const token = jwt.sign(
            { id: manageAdmin._id, role: 'manageHackathon' },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: manageAdmin._id,
                email: manageAdmin.email,
                role: 'manageHackathon'
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }

}

module.exports.getAllApplications = async (req, res) => {
  try {
    // Fetch all applications
    const applications = await HackathonParticipant.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching applications',
      error: error.message
    });
  }
};

// Update application status
module.exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status against the updated enum values
    if (!['pending_proposal', 'pending', 'under_review', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending_proposal, pending, under_review, shortlisted, or rejected.'
      });
    }

    // Find and update the application
    const application = await HackathonParticipant.findByIdAndUpdate(
      id,
      { applicationStatus: status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    await sendHackathonStatusEmail(
      application.email,
      application.fullName,
      status,
      application.domain,
      req.body.remarks || '' // Optional remarks from admin
    );
    // TODO: Send email notification to participant about status change

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating application status',
      error: error.message
    });
  }
};
const proposalUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Allow only PDF files for proposals
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed for proposals.'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).single('proposalFile');

// Controller to submit/update proposal after registration
module.exports.submitProposal = async (req, res) => {
  try {
    // Process file upload
    await new Promise((resolve, reject) => {
      proposalUpload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return reject({
            status: 400,
            message: 'File upload error',
            error: err.message
          });
        } else if (err) {
          return reject({
            status: 500,
            message: 'Upload error',
            error: err.message
          });
        }
        resolve();
      });
    });

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No proposal file was uploaded'
      });
    }

    // Get user ID from authenticated token
    const userId = req.user.id;

    // Find participant by ID
    const participant = await HackathonParticipant.findById(userId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Update the proposal file
    participant.proposalFile = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname,
      fileSize: req.file.size
    };
    participant.isProposal = true;

    // If the status was "pending_proposal", update it to "pending"
    if (participant.applicationStatus === 'pending_proposal') {
      participant.applicationStatus = 'pending';
    }

    // Save the updated participant
    await participant.save();

    return res.status(200).json({
      success: true,
      message: 'Proposal submitted successfully',
      fileName: req.file.originalname
    });

  } catch (error) {
    console.error('Proposal submission error:', error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'An error occurred during proposal submission',
      error: error.error || error.message
    });
  }
};

// Controller to get participant's proposal status
module.exports.getProposalStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const participant = await HackathonParticipant.findById(userId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Return proposal status information
    return res.status(200).json({
      success: true,
      hasProposal: !!participant.proposalFile,
      proposalName: participant.proposalFile ? participant.proposalFile.fileName : null,
      applicationStatus: participant.applicationStatus,
      domain: participant.domain
    });

  } catch (error) {
    console.error('Error fetching proposal status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve proposal status',
      error: error.message
    });
  }
};
// Backend controller
exports.downloadFile = async (req, res) => {
  try {
    const { id, fileType } = req.params;

    // Validate file type
    if (!['idCard', 'proposalFile'].includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Must be idCard or proposalFile.'
      });
    }

    // Find the application
    const application = await HackathonParticipant.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if the file exists
    if (!application[fileType] || !application[fileType].data) {
      return res.status(404).json({
        success: false,
        message: `No ${fileType} file found for this application`
      });
    }

    // Set content type based on the file's stored contentType
    res.set('Content-Type', application[fileType].contentType);
    res.set('Content-Disposition', `attachment; filename="${application[fileType].fileName}"`);
    
    // Send the file data
    res.send(application[fileType].data);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while downloading the file',
      error: error.message
    });
  }
};