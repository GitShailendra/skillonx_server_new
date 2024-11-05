const mongoose = require("mongoose");

const featureenrollmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  featuredCourse: {
    type: String,
    required: true,
  },
});

module.exports= mongoose.model("Enrollment", featureenrollmentSchema);
