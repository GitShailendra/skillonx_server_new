// models/Consultation.js
const mongoose = require("mongoose");

const workshopConsultationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String,  enum: ["Individual", "Organization"] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Consultation", workshopConsultationSchema);
