const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    u_no: {
        type: Number,
        required: true
    }
})

const Group = mongoose.model('Group', groupSchema)

module.exports = Group