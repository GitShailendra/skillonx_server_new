// models/CallbackRequest.js
const mongoose = require("mongoose");

const callbackRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CallbackRequest", callbackRequestSchema);
