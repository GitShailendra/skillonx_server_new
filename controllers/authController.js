const Student = require("../models/Student");
const University = require("../models/University");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user is a student
    const student = await Student.findOne({ email });
    if (student) {
      const isPasswordCorrect = await bcrypt.compare(password, student.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token for the student
      const token = jwt.sign({ id: student._id, userType: 'student' }, 'yourSecretKey', { expiresIn: '1h' });
      console.log(token,"   this is toke")
      // Respond with token and redirect URL for student dashboard
      return res.json({ token, redirectUrl: '/student-dashboard' });
    }

    // Check if the user is a university
    const university = await University.findOne({ email });
    if (university) {
      const isPasswordCorrect = await bcrypt.compare(password, university.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token for the university
      const token = jwt.sign({ id: university._id, userType: 'university' }, 'yourSecretKey', { expiresIn: '1h' });
      console.log(token)

      // Respond with token and redirect URL for university dashboard
      return res.json({ token, redirectUrl: '/university-dashboard' });
    }

    // If no matching user found
    return res.status(400).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
