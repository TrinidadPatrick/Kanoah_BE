const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const messages = require('../Models/MessageModel')
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken')

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
                const documentCount = await messages.countDocuments({ conversationId: conversationId})
                const messagesArray = await messages
                    .find({ conversationId: conversationId})
                    .skip(0)
                    .limit(returnLimit)
                    .sort({
                        'createdAt' : -1
                    }).populate('virtualServiceInquired', 'basicInformation serviceProfileImage').populate('participants', '_id profileImage firstname lastname')
                    .exec();
                const result = messagesArray.reverse()
                return res.json({result, documentCount});
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