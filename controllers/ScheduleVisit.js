const ScheduleVisit = require("../models/ScheduleVisit")
exports.createScheduleVisit = async (req, res) => {
    try {
      const newCallbackRequest = new ScheduleVisit(req.body);
      await newCallbackRequest.save();
      res.status(201).json({ message: "Callback request created successfully", callbackRequest: newCallbackRequest });
    } catch (error) {
      res.status(500).json({ message: "Error creating callback request", error });
    }
  };