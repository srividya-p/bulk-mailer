const mongoose = require('mongoose')

const smtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true
    }
})

const Smtp = mongoose.model('Smtp', smtpSchema)

module.exports = Smtp