const mongoose = require('mongoose')

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        default: 'Sent'
    }
})

const Campaign = mongoose.model('Campaign', campaignSchema)

module.exports = Campaign