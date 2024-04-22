const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    conversationId: {type : String, required: true},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User_Info', index : true }],
    serviceInquired : { type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    readBy : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User_Info' }],
    message : 
    {
        sender : {type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'},
        receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'},
        content: String,
        size : {type : Object},
        date : {type: String},
        timestamp : {type: String}
    }

})

module.exports = mongoose.model("chat_data", chatSchema)