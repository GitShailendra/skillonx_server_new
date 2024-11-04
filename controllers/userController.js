// controllers/userController.js
const User = require('../models/User');

// Register User
exports.registerUser = async (req, res) => {
    console.log(req.body); // Debugging line

  const { userType, firstName, lastName, gender, phone, email, password, address, education, universityDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      userType,
      firstName,
      lastName,
      gender,
      phone,
      email,
      password,
      address,
      education,
      universityDetails,
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      message: 'User registered successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
