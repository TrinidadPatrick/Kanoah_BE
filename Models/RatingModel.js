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
        type: String, 
        required : true
    },
    status : {
        type : String, 
        required : true,
        default : "Active"
    }
    
})

module.exports = mongoose.model("ratings", RatingSchema)