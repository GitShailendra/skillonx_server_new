const FeaturedEnrollment = require("../models/FeaturedCourseEnrollment");

//create a new Enrollment 
exports.createEnrollment = async (req, res) => {
    const { name, email, phone, education, featuredCourse } = req.body;
    try {
      const newEnrollment = new FeaturedEnrollment({
        name,
        email,
        phone,
        education,
        featuredCourse,
      });
      await newEnrollment.save();
      res.status(201).json(newEnrollment);
    } catch (error) {
      res.status(500).json({ message: "Error creating enrollment" });
    }
  };