const Email = require("../models/StayConnected")

exports.StayConnected = async (req,res)=>{
    const {email} = req.body;
    try{
        const newEmail = new Email({email});
        await newEmail.save();
        res.status(201).json("email saved");

    } 
    catch(e){
        res.status(500).json({message:e.message})
    }
}