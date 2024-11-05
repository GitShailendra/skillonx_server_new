const express = require('express')
const router = express.Router();
const {submitQuestion} = require("../controllers/SubmitQuestionController")
router.post("/",submitQuestion)
module.exports  = router;