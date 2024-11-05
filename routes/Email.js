const express = require("express")

const router = express.Router();
const {StayConnected} = require("../controllers/emailController")
router.post("/",StayConnected)

module.exports= router