const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: false
    },
    phone: {
        type: Number,
        trim: true
    },
    address: {
        type: String,
        trim: true
    }, 
    country: {
        type: String,
        trim: true
    }, 
    group: {
        type: String,
        trim: true
    }
   
})

const User = mongoose.model('User', userSchema)

module.exports = User