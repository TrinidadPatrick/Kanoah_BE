const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true
        
    },
    firstname : {
        type : String,
        required : true,
        
    },
    lastname : {
        type : String,
        required : true,
        
    },
    contact : {
        type : String,
        required : true,
        unique : true
    },
    birthDate : {
        type : Object,
        required : true,
        
    },
    profileImage : {
        type : String,
        required : true
    },
    verified : {
        type : String,
        required : true
    },
    Address : {
        type : Object,
        default : null
    },
    status : {
        type : {},
        default : {status : "Active", reasons : []}
    },
    Role : {
        type : String,
        default : "User"
    },
    createdAt : {
        type : String,
        default: () => new Date().toISOString()
    }
})

module.exports = mongoose.model("User_Info", userSchema)