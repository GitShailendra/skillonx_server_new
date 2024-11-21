const bcrypt = require("bcrypt")
const Student = require('../models/Student');
const University = require('../models/University'); 
const {generateToken} = require("../utils/generateToken");
const Workshop = require("../models/Workshop");
const Assessment = require("../models/AssessmentModel");
// Controller for registering a university
exports.registerUniversity = async (req, res) => {
  try {
    // Check if user already exists
    const existingUniversity = await University.findOne({ email: req.body.email });
    if (existingUniversity) {
      return res.status(400).json({ message: 'Universituy already registered' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const university = new University({
      ...req.body,
      password: hashedPassword
    });
    await university.save();
    const token = generateToken(university);
    
    // Remove password from response
    const universityResponse = university.toObject();
    delete universityResponse.password;
    //set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: universityResponse
    });
    } catch (error) {
    // Handling validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'An error occurred while registering the university' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const university = await University.findOne({ email });
    if (!university) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, university.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(university);

    // Remove password from response
    const universityResponse = university.toObject();
    delete universityResponse.password;

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
      user: universityResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
};

exports.getStudents = async (req, res) => {
  const { uniId } = req.params;
  
  try {
      // First find the university to get its name
      const university = await University.findById(uniId);
      console.log(university)
      if (!university) {
          return res.status(404).json({
              success: false,
              message: 'University not found'
          });
      }

      // Find all students with matching university name
      const students = await Student.find({ 
          universityName: university.universityName 
      });

      res.status(200).json({
          success: true,
          data: students,
          message: `Found ${students.length} students from ${university.universityName}`
      });

  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Error retrieving students',
          error: error.message
      });
  }
};
exports.getWorkshopRegistrations = async (req, res) => {
  try {
    const { uniId } = req.params;
    const university = await University.findById(uniId);
    if (!university) {
      return res.status(404).json({
        status: 'error',
        message: 'University not found'
      });
    }
    // Populate with error handling for missing references
    await university.populate([
      {
        path: 'workshopRegistrations.student',
        select: 'firstName lastName',
        options: { strictPopulate: false }
      },
      {
        path: 'workshopRegistrations.workshop',
        select: 'title',
        options: { strictPopulate: false }
      }
    ]);

    // Filter out registrations with missing workshop or student data
    const registrations = university.workshopRegistrations
      .filter(reg => 
        !reg.isRead && 
        reg.workshop && 
        reg.student && 
        reg.student.firstName && 
        reg.student.lastName
      )
      .map(reg => ({
        id: reg._id,
        studentName: `${reg.student.firstName} ${reg.student.lastName}`,
        workshopTitle: reg.workshop.title,
        date: reg.registrationDate
      }))
      .filter(Boolean); // Remove any null entries

    // Log for debugging
    console.log('Total registrations found:', university.workshopRegistrations.length);
    console.log('Valid registrations after filtering:', registrations.length);

    res.status(200).json({
      status: 'success',
      registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching workshop registrations'
    });
  }
};

// Clear all notifications
exports.clearNotifications = async (req, res) => {
  const { uniId } = req.params;
  
  try {
    const result = await University.findByIdAndUpdate(
      uniId,
      {
        $set: {
          "workshopRegistrations.$[elem].isRead": true
        }
      },
      {
        arrayFilters: [{ "elem.isRead": false }],
        new: true
      }
    );

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'University not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'All notifications cleared',
      data: result.workshopRegistrations
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error clearing notifications'
    });
  }
};

exports.getdashboardData = async (req, res) => {
  try {
    const { uniId } = req.params;
    const university = await University.findById(uniId)
      .populate({
        path: 'students',
        options: { 
          sort: { createdAt: -1 },
          limit: 4
        },
        select: 'firstName lastName email createdAt universityName'
      })
      .populate({
        path: 'workshops',
        options: { 
          sort: { createdAt: -1 },
          limit: 5 
        },
        select: 'title description duration startDate createdAt'
      })
      .populate({
        path: 'workshopRegistrations',
        populate: [
          {
            path: 'student',
            select: 'firstName lastName'
          },
          {
            path: 'workshop',
            select: 'title'
          }
        ],
        options: { 
          sort: { registrationDate: -1 },
          limit: 5 
        }
      });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    // Get counts
    const workshopCount = university.workshops.length;
    const assessmentCount = university.assessments.length;
    const studentCount = university.students.length;
    const workshopRegistrationCount = university.workshopRegistrations.length;

    // Get workshop registrations by status
    const workshopRegistrationsByStatus = {
      registered: university.workshopRegistrations.filter(reg => reg.status === 'registered').length,
      attended: university.workshopRegistrations.filter(reg => reg.status === 'attended').length,
      completed: university.workshopRegistrations.filter(reg => reg.status === 'completed').length,
      cancelled: university.workshopRegistrations.filter(reg => reg.status === 'cancelled').length
    };

    // Format recent students data
    const recentStudents = university.students.map(student => ({
      id: student._id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      joinedDate: student.createdAt,
      university: student.universityName
    }));

    // Format recent workshops data
    const recentWorkshops = university.workshops.map(workshop => ({
      id: workshop._id,
      title: workshop.title,
      description: workshop.description,
      duration: workshop.duration,
      startDate: workshop.startDate,
      createdAt: workshop.createdAt
    }));

    // Format recent registrations data
    const recentRegistrations = university.workshopRegistrations
      .filter(reg => reg.student && reg.workshop) // Filter out any invalid registrations
      .map(reg => ({
        id: reg._id,
        studentName: `${reg.student.firstName} ${reg.student.lastName}`,
        workshopTitle: reg.workshop.title,
        status: reg.status,
        registrationDate: reg.registrationDate
      }));

    res.status(200).json({
      success: true,
      data: {
        workshops: {
          total: workshopCount,
          registrations: {
            total: workshopRegistrationCount,
            byStatus: workshopRegistrationsByStatus
          },
          recentWorkshops // New field
        },
        assessments: {
          total: assessmentCount,
        },
        students: {
          total: studentCount,
          recentStudents // New field
        },
        recentActivity: {
          registrations: recentRegistrations // New field
        }
      }
    });

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};
exports.getName = async (req,res)=>{
  try{
      const university = await University.find({}).select('universityName')
      const student = await Student.find({}).select('universityName')
      if(!university){
        return res.status(404).json({
          success:false,
          message:"university not found"
        })
      }
      res.status(200).json({
        success:true,
        data:{
          university,
          student
        },
        message:"university fetched successfully"
      })
  }catch(error){
    res.status(400).json({
      success:false,
      message:error.message
    })
  }
}