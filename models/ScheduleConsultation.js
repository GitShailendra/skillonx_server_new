const mongoose = require("mongoose");

const scheduleconsultation = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    scheduleTitle: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
  });

module.exports = mongoose.model("ScheduleConsultation",scheduleconsultation)