const mongoose = require('mongoose')

const DoNotShowSchema = new mongoose.Schema({
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

module.exports = mongoose.model("DoNotShow", DoNotShowSchema)