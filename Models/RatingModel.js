const mongoose = require('mongoose')

const RatingSchema = mongoose.Schema({
    booking : {
        type: mongoose.Schema.Types.ObjectId, ref: 'bookings'
    },
    service : {
        type: mongoose.Schema.Types.ObjectId, ref: 'services'
    },
    user : {
        type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'
    },
    rating : {
        type: Number, 
        required : true
    },
    review : {
        type: String, 
        required : true
    },
    createdAt : {
        type: Date, 
        required : true
    },
    
})

module.exports = mongoose.model("ratings", RatingSchema)