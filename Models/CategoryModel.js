const mongoose = require('mongoose')

const Categories = new mongoose.Schema({
    category_code : {
        type : String, 
        required : true,
    },
    parent_code : {
        type : String, 
        required : true,
    },
    subCategory_code : {
        type : String, 
        required : true,
    },
    name : {
        type : String, 
        unique : true
    },
    image : {
        type : String, 
    },
    featured : {
        type : Boolean, 
        default : false
    },
    type : {
        type : String, 
        required : true
    },
    createdAt : {
        type : Date
    },
    status : {
        type : String,
        default : "Active"
    }

})

module.exports = mongoose.model('Categories', Categories)