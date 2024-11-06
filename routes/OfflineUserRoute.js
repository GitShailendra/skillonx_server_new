const express = require("express")

const router = express.Router();
const {createUser}= require("../controllers/OfflineUser")
router.post("/",createUser)
module.exports = router