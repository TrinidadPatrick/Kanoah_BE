const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    conversationId: {type : String, required: true},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User_Info' }],
    serviceInquired : { type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    message : 
    {
        sender : {type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'},
        receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'},
        content: String,
        date : {type: String},
        timestamp : {type: String}
    }

})

module.exports = mongoose.model("chat_data", chatSchema)