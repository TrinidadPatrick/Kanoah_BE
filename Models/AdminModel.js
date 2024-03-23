const mongoose = require('mongoose')

const admins = new mongoose.Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true
        },
        password : {
            type : String,
            required : true,
            unique : true
        },
        email : {
            type : String,
            required : true,
            unique : true
        },
        firstname : {
            type : String,
            required : true,
        },
        lastname : {
            type : String,
            required : true,
        },
        Role : {
            type : String,
            required : true,
            default : "Admin"
        },
        createdAt : {
            type : String
        },
        status : {
            type : String,
            default : "Active"
        }


    }
)

module.exports = mongoose.model('Admins', admins)