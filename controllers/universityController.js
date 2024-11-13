const bcrypt = require("bcrypt")
const Student = require('../models/Student');
const University = require('../models/University'); 
const {generateToken} = require("../utils/generateToken")
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