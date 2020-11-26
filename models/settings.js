const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema({
    default_email: {
        type: String,
        required: true,
        trim: true
    }, 
    mail_count: {
        type: Number,
        default: 0
    }
})

const Settings = mongoose.model('Settings', settingSchema)

module.exports = Settings