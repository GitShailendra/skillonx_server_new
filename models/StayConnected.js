const mongooose = require("mongoose")

const EmailSchema = new mongooose.Schema({
    email:{
        type:String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address',
        ],
    },
    
});

module.exports = mongooose.model("Email",EmailSchema)