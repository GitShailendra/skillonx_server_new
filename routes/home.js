const express = require("express")

const router = express.Router();

router.get("/",(req,res)=>{
    res.send("component mounted");
    console.log("component is called");
});

module.exports = router;