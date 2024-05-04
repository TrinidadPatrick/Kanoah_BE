const mongoose = require('mongoose')


const ServiceSchema = new mongoose.Schema({
        createdAt : {
            type : String
        },
        userId : {
            type :  mongoose.Schema.Types.ObjectId
        }, 
        owner : {
            type :  mongoose.Schema.Types.ObjectId,
            ref: "User_Info"
        },
        basicInformation : {
            type : Object,
            
        }, 
        advanceInformation : {
            type : Object,
            ref : 'Categories',
            ServiceCategory : {
                type: mongoose.Schema.Types.ObjectId,
                ref : 'Categories'
            },
            ServiceSubCategory : {
                type: mongoose.Schema.Types.ObjectId,
                default : null,
                ref : 'Categories'
            }
        },
        acceptBooking : {
            type : Boolean,
            default : false
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
        serviceOffers : {
            type : Array,
            default : []
        },
        status : {
            type : {},
            default : {status : "Active", reasons : []}
        },
        booking_limit : {
            type : Number,
            default : 1
        },
        cancelationPolicy : {
            type : {},
            default : {
                cancelTimeLimit : {day : 0, hour : 0, minutes : 0},
                cancelPolicy : 'Upon booking, clients are unable to directly cancel their reservation but may request cancellation through the service provider. The cancellation timeframe is determined by the service provider.'
            }
        },
        isDeactivated : {
            type : Boolean,
            default : false
        }
        
})

module.exports = mongoose.model("services", ServiceSchema)