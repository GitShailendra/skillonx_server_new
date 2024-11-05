const ProfessionalCourse = require("../models/ProfessionalCourse");

//create a new Enrollment 
exports.createProfessionalEnrollment = async (req, res) => {
    const { name, email, phone, education ,featuredCourse} = req.body;
    try {
      const newProfessionalCourse = new ProfessionalCourse({
        name,
        email,
        phone,
        education,
        featuredCourse
      });
      await newProfessionalCourse.save();
      res.status(201).json(newProfessionalCourse);
    } catch (error) {
      res.status(500).json({ message: "Error creating enrollment" });
    }
  };