const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
    shop : {
        type: mongoose.Schema.Types.ObjectId, ref: 'services'
    },
    client : {
        type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'
    },
    service : {
        type: Object
    },
    schedule : {
        type: Object
    },
    status : {
        type: String,
        default : "INPROGRESS"
    },
    contactAndAddress : {
        type : Object
    },
    createdAt : {
        type : String,
        required : true
    },
    service_fee : {
        type : Number,
        required : true
    },
    booking_fee : {
        type : Number,
        required : true
    },
    net_Amount : {
        type : Number,
        required : true
    },
    booking_id : {
        type : String,
        required : true
    },
    rated : {
        type : Boolean,
        default : false
    }
})

module.exports = mongoose.model('bookings', BookingSchema)