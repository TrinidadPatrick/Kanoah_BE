const mongoose = require('mongoose')

const FavoriteSchema = new mongoose.Schema({
    service : {
        type : mongoose.Schema.Types.ObjectId, ref: 'services'
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId
    },
    createdAt : {
        type : Date
    }
})

module.exports = mongoose.model("favorites", FavoriteSchema)