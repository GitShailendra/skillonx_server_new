const University = require('../models/University');

// Controller for registering a university
exports.registerUniversity = async (req, res) => {
  try {
    const university = new University(req.body);
    await university.save();
    res.status(201).json({ message: 'University registered successfully' });
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
