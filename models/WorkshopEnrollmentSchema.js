// models/WorkshopEnrollment.js
const mongoose = require("mongoose");

const workshopEnrollmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  workshopName: { type: String, required: true },
  batchSize: { type: Number, required: true },
  mode: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  altDate: Date,
  altTime: String,
  institution: { type: String, required: true },
  departmentSize: Number,
  requirements: String,
});

module.exports = mongoose.model("WorkshopEnrollment", workshopEnrollmentSchema);
