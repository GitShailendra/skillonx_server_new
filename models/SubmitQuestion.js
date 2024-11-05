const mongoose = require("mongoose");

const notFoundQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SubmitQuestion",notFoundQuestionSchema)