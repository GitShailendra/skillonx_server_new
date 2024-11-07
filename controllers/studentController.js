const bcrypt = require('bcrypt');
const Student = require('../models/Student');

// Controller for registering a student
exports.registerStudent = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword);
    const student = new Student({
      ...req.body,
      password: hashedPassword
    });    
    await student.save();
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    // Handling validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'An error occurred while registering the student' });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database
    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate a token
    

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};