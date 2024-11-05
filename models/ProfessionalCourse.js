const mongoose = require("mongoose");

const ProfessionalCourse = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  featuredCourse:{type:String},
  phone: { type: String, required: true },
  education: { type: String, required: true },
});

module.exports= mongoose.model("ProfessionalCourse", ProfessionalCourse);

