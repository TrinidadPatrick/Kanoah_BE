const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    notification_type : {
        type : String,
        required : true

    },
    isRead : {
        type : Boolean,
        default : false,
        required : true
    },
    createdAt : {
        type : Date,
        required : true
    },
    content : {
        type : Object,
        required : true
    },
    client : {
        type : mongoose.Schema.Types.ObjectId, ref: 'User_Info',
    },
    notif_to : {
        type : mongoose.Schema.Types.ObjectId, ref: 'User_Info',
        required : true
    },
    reference_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
})

module.exports = mongoose.model("notifications", notificationSchema)