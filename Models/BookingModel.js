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
        default : "PENDING"
    },
    contactAndAddress : {
        type : Object
    },
    createdAt : {
        type : Date,
        required : true
    },
    Booking_id : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('bookings', BookingSchema)