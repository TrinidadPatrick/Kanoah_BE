const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    conversationId: {type : String, index : true},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User_Info', index : true }],
    serviceInquired : { type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    readBy : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User_Info' }],
    messageType : {type : String, required : true}, 
    createdAt : {type : Date, required : true},
    messageContent : 
    {
        sender : {type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'},
        receiver: {type: mongoose.Schema.Types.ObjectId, ref: 'User_Info'},
        content: String,
        date : {type: String},
        timestamp : {type: String}
    }

})

messageSchema.virtual('virtualServiceInquired', {
    ref: 'services',
    localField: 'serviceInquired',
    foreignField: 'userId',
    justOne: true, // Assuming you want only one service per message
  });

  messageSchema.set('toObject', { virtuals: true });
messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("message_data", messageSchema)