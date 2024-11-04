const mongoose = require("mongoose");

const workshopschedule = new mongoose.Schema({
  university: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  workshopType: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  batchSize: { type: Number, required: true },
});

const WorkshopSchedule = mongoose.model("WorkshopSchedule", workshopschedule);
module.exports = WorkshopSchedule;
