const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const {generateToken} = require("../utils/generateToken")
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
    
    // Create new student
    const student = new Student({
      ...req.body,
      password: hashedPassword
    });
    
    await student.save();

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

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: studentResponse
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
    console.log(error.message)
    res.status(500).json({ error: 'An error occurred while registering the student' });
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

exports.registerWorkshop = async (req,res)=>{
try{
  const{workshopId,studentId,workshopTitle,workshopDate,workshopVenue} = req.body;
  const student = await Student.findById(studentId);
  if (student.workshops.includes(workshopId)) {
    return res.status(400).json({
      status: 'error',
      message: 'You have already registered for this workshop'
    });
  }
  const stud = await Student.findByIdAndUpdate(
    studentId,
    {$push:{workshops:workshopId}},
    {new:true}
  );
  res.status(201).json({
    status: 'success',
    data: stud
  });


}
catch(error){
  console.error('Assessment creation error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
}
}
