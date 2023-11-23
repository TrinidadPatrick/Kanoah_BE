const mongoose = require('mongoose')

const ServiceSchema = new mongoose.Schema({
        createdAt : {
            type : String
        },
        userId : {
            type : String
        }, 
        owner : {
            type :  mongoose.Schema.Types.ObjectId,
            ref: "User_Info"
        },
        basicInformation : {
            type : Object
        }, 
        advanceInformation : {
            type : Object
        },
        address : {
            type : Object
        },
        serviceHour : {
            type : Object
        },
        tags : {
            type : [String]
        },
        galleryImages : {
            type : Array
        },
        featuredImages : {
            type : Array
        },
        serviceProfileImage : {
            type : String,
            default : null
        },
        ratings: {
            type: Array,
            default: [
              { stars: 5, count: 0 },
              { stars: 4, count: 0 },
              { stars: 3, count: 0 },
              { stars: 2, count: 0 },
              { stars: 1, count: 0 },
            ]
          }
        
})

module.exports = mongoose.model("services", ServiceSchema)