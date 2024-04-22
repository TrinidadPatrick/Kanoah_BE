const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const messages = require('../Models/MessageModel')
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken')

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

// Get all contacts that the user communicated with
module.exports.Mobile_retrieveContacts = async (req,res) => {
    const {_id} = req.params
    const accessToken = req.headers.authorization.split(' ')[1]

    const getContacts = async (user) => {
        try {
            const chatIds = await messages.distinct('conversationId', { participants : { $in: [_id]}})
            const uniqueChats = new Set(chatIds)
            const chats = await Promise.all([...uniqueChats].map(async (conversationId)=>{
            const chat = await messages.findOne({ participants : _id, conversationId}).sort({ createdAt: -1 })
            .populate('participants', 'username profileImage firstname lastname')
            .populate('virtualServiceInquired', 'basicInformation serviceProfileImage owner')
            return chat
            }))
            return res.json(chats);
        } catch (error) {
            return res.status(404).send({status : "failed"})
        }
    }
    

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      jwt.verify(accessToken, process.env.SECRET_KEY, (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        getContacts(user)
        
      });
}

// Get specific chats
module.exports.Mobile_getMessages = async (req,res) => {
    const {conversationId} = req.params
    const {returnLimit} = req.params
    const {serviceOwnerId} = req.params
    const accessToken = req.headers.authorization.split(' ')[1]
    // console.log(conversationId, returnLimit, serviceOwnerId)
    // the serviceOwnerId is the userId of the owner of the service
    const getMessage = async (userId) => {
        if(conversationId !== "null")
        {
            try {
                // const documentCount = await messages.countDocuments({ conversationId: conversationId})
                const messagesArray = await messages
                    .find({ conversationId: conversationId})
                    .skip(0)
                    .limit(returnLimit)
                    .sort({
                        'createdAt' : -1
                    }).populate('virtualServiceInquired', 'basicInformation serviceProfileImage').populate('participants', '_id profileImage firstname lastname')
                    .exec();
                const result = messagesArray.reverse()
                return res.json({result});
            } catch (error) {
                return res.status(404).send({status : "failed"})
            }
        }
        else if(conversationId === "null") //this just means that the user clicks chat now from the view service
        {
            try {
                // const documentCount = await messages.countDocuments({$and : [{ serviceInquired: serviceOwnerId}, {participants : {$in : userId}}]})
                const messagesArray = await messages
                    .find({$and : [{ serviceInquired: serviceOwnerId}, {participants : {$in : userId}}]})
                    .skip(0)
                    .limit(returnLimit)
                    .sort({
                        'createdAt' : -1
                    }).populate('virtualServiceInquired', 'basicInformation serviceProfileImage').populate('participants', '_id profileImage')
                    .exec();
                const result = messagesArray.reverse()
                return res.json({result});
            } catch (error) {
                return res.status(404).send({status : "failed"})
            }
        }

    }   
    

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      jwt.verify(accessToken, process.env.SECRET_KEY, (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        getMessage(user._id)
        
      });
}

// Send the message
module.exports.Mobile_sendMessage = async (req,res) => {
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
    const checkChatExisting = await messages.findOne({conversationId : existingConversationId})
    // If conversation id is existing, create a new document with the conversation id same as the existing one
    if(checkChatExisting != null)
    {
        try {
            const result = await messages.create({conversationId : existingConversationId, participants,serviceInquired,readBy, createdAt,messageType, deletedFor : [],  messageContent})
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : error})
        }
    }
    // if conversation id is not existing, create a new document with a new conversation id
    else
    {
        try {
            
            const result = await messages.create({conversationId, participants,serviceInquired, readBy, createdAt,messageType,deletedFor : [], messageContent})
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : error})
        }
    }
    
    
    
}


module.exports.Mobile_countUnreadMessages = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]
    const checkMessage = async (userId) => {
        try {
            const unreadMessages = await messages.countDocuments({
                participants: userId,
                readBy: { $nin: [userId] }
              })
            return res.status(200).json(unreadMessages)
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }
    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      try {
        jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
          if(err)
          {
              return res.status(403).json({ error: 'Forbidden' });
          }
          
          checkMessage(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}