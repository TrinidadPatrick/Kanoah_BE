const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const messages = require('../Models/MessageModel')
const socketIO = require('socket.io');

// Generate random ID
function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
    let randomId = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters.charAt(randomIndex);
    }
  
    return randomId;
}

//Get all Users except the current user
module.exports.fetchAllUsers = async (req,res) => {
    const {_id} = req.params

    try {
        const users = await user.find({_id : {$ne : _id}})
        return res.json(users)
    } catch (error) {
        return status(404).send({status : "Failed"})
    }
}

// Get receiver information
module.exports.getReceiver = async (req,res) => {
    const {userId} = req.params
    try {
        const receiver = await user.findById(userId).select('_id firstname lastname profileImage');
        return res.json(receiver)
    } catch (error) {
        return res.status(404).send({status : "Failed"})
    }
}

//get service information
module.exports.getServiceFromChat = async (req,res) => {
    const {serviceId} = req.params
    try {
        const result = await Service.findOne({userId : serviceId})
        
        return res.json(result)
    } catch (error) {
        return res.status(404).send({message : "failed"})
    }
}

// Send the message
module.exports.sendMessage = async (req,res) => {
    // Generated Conversation ID
    const conversationId = generateRandomId(60)
    const existingConversationId = req.body.conversationId
    const data = req.body
    const participants = data.participants
    const messageContent = data.messageContent
    const readBy = data.readBy
    const createdAt = data.createdAt
    const messageType = data.messageType
    const serviceInquired = data.serviceInquired
    //check if the conversation between user is existing
    const checkChatExisting = await messages.findOne({conversationId : req.body.conversationId})

    // If conversation id is existing, create a new document with the conversation id same as the existing one
    if(checkChatExisting != null)
    {
        try {
            const result = await messages.create({conversationId : existingConversationId, participants,serviceInquired,readBy, createdAt,messageType,  messageContent})
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : error})
        }
    }
    // if conversation id is not existing, create a new document with a new conversation id
    else
    {
        try {
            const result = await messages.create({conversationId, participants,serviceInquired, readBy, createdAt,messageType, messageContent})
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : error})
        }
    }
    
    
    
}

// Get all contacts that the user communicated with
module.exports.retrieveContacts = async (req,res) => {
    const {_id} = req.params

    try {
        const chatIds = await messages.distinct('conversationId', { participants : { $in: [_id]}})
        const uniqueChats = new Set(chatIds);
        const chats = await Promise.all([...uniqueChats].map(async (conversationId)=>{
        const chat = await messages.findOne({ participants : _id, conversationId}).sort({ createdAt: -1 })
        .populate('participants', 'username profileImage firstname lastname')
        .populate('virtualServiceInquired', 'basicInformation serviceProfileImage')
        return chat
        }))
        
          return res.json(chats);
    } catch (error) {
        return res.status(404).send({status : "failed"})
    }
}

// Get specific chats
module.exports.getMessages = async (req,res) => {
    const {conversationId} = req.params
    const {returnLimit} = req.params
    try {
        const documentCount = await messages.countDocuments({ conversationId: conversationId })
        const messagesArray = await messages
            .find({ conversationId: conversationId })
            .skip(0)
            .limit(returnLimit)
            .sort({
                'createdAt' : -1
            }).populate('virtualServiceInquired', 'basicInformation serviceProfileImage').populate('participants', '_id')
            .exec();
            // console.log(documentCount)
        const result = messagesArray.reverse()
        return res.json({result, documentCount});
    } catch (error) {
        return res.status(404).send({status : "failed"})
    }
}

// Get all chats related to user
module.exports.getAllMessages = async (req,res) => {
    const {_id} = req.params

    try {
        const allChats = await messages.find({ participants : { $in: [_id]}})
        return res.json(allChats)
    } catch (error) {
        return res.status(404).send({status : "failed"})
    }
}

module.exports.handleReadMessage = async (req,res) => {
    const conversationId = req.body.conversationId
    const myId = req.body.myId

    const chats = await messages.updateMany({conversationId : conversationId, readBy : { $nin : myId}}, { $push: { readBy: myId } })

    // console.log(chats)

    // try {
    //     toRead.map(async(chat) => {
    //        const messageId = chat._id
    //        const test = await messages.updateOne({_id : messageId}, {$push : {readBy : myId}})
           
           
    //     });
    // } catch (error) {
    //     return res.status(404).send({status : 'Failed'})
    // }
    return res.json({message : 'success'})
}