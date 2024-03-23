const mongoose = require('mongoose')

const reports = new mongoose.Schema({
    service : {
        type : {}
    },
    photos : {
        type : Array
    },
    reasons : {
        type : Array
    },
    textDetails : {
        type : String,
    },
    createdAt : {
        type : Date
    },
    status : {
        default : "Pending",
        type : String //either Pending, Accepted, Rejected
    },
    reportedBy : {
        type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'
    }
})

module.exports = mongoose.model('Reports', reports)