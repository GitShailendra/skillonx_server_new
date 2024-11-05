const SubmitQuestion = require("../models/SubmitQuestion")

exports.submitQuestion = async (req,res)=>{
    try{
        const newQuestsion = new SubmitQuestion(req.body);
        await newQuestsion.save();
        res.status(201).json({message:"Question submitted successfully"});
    }catch(e){
        res.status(500).json({ message: "Error Submitting question request", error });
    }
}