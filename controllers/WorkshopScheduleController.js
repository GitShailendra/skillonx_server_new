const WorkshopSchedule = require("../models/WorkshopSchedule");
const WorkshopEnrollmentSchema = require("../models/WorkshopEnrollmentSchema");
const WorkshopConsultation = require("../models/WorkshopCousultation")
const CallbackRequest = require("../models/CallbackRequest")
exports.createWorkshopSchedule = async (req, res) => {
  try {
    const newEnrollment = new WorkshopSchedule(req.body);
    await newEnrollment.save();
    res.status(201).json(newEnrollment);
  } catch (error) {
    res.status(500).json({ message: "Error creating workshop enrollment" });
  }
};
exports.createWorkshopEnrollment = async (req, res) => {
  try {
    const newEnrollment = new WorkshopEnrollmentSchema(req.body);
    await newEnrollment.save();
    res.status(201).json({ message: "Enrollment successful", enrollment: newEnrollment });
  } catch (error) {
    res.status(500).json({ message: "Error creating workshop enrollment", error });
  }
};
exports.createConsultation = async (req, res) => {
  try {
    const newConsultation = new WorkshopConsultation(req.body);
    await newConsultation.save();
    res.status(201).json({ message: "Consultation scheduled successfully", consultation: newConsultation });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling consultation", error });
  }
};
exports.createCallbackRequest = async (req, res) => {
  try {
    const newCallbackRequest = new CallbackRequest(req.body);
    await newCallbackRequest.save();
    res.status(201).json({ message: "Callback request created successfully", callbackRequest: newCallbackRequest });
  } catch (error) {
    res.status(500).json({ message: "Error creating callback request", error });
  }
};
