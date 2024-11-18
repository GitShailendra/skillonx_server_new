const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please provide a valid email',
        ],
      },
      password: {
        type: String,
        required: true,
        select: false,
      },
    role: {
        type: String,
        default: 'admin',
        immutable: true // Cannot be changed once set
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin