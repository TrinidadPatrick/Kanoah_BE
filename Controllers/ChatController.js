const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const chats = require('../Models/ChatModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
require("dotenv").config();

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

// Gets all chats
module.exports.getAllChats = async (req,res) => {
    const allChats = await chats.find();
    res.json({allChats})
}

// Send chats
module.exports.sendChat = async (req,res) => {
    // Generated Conversation ID
    const conversationId = generateRandomId(30)
    const existingConversationId = req.body.conversationId
    const data = req.body
    const participants = data.participants
    const message = data.message
    const readBy = data.readBy
    const serviceInquired = data.serviceInquired
    //check if the conversation between user is existing
    const checkChatExisting = await chats.findOne({conversationId : req.body.conversationId})
    
    // If conversation id is existing, create a new document with the conversation id same as the existing one
    if(checkChatExisting != null)
    {
        try {
            const result = await chats.create({conversationId : existingConversationId, participants,serviceInquired,readBy, message})
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : error})
        }
    }
    // if conversation id is not existing, create a new document with a new conversation id
    else
    {
        try {
            const result = await chats.create({conversationId, participants,serviceInquired, readBy, message})
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : error})
        }
    }
    
    
    
}

// Get all chats for the specific user
module.exports.getUserChats = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await chats.find({participants : {$all: [userId]}}).populate('message.sender', 'username profileImage firstname lastname')
        .populate('message.receiver', 'username profileImage firstname lastname')
        .populate('participants', 'username profileImage firstname lastname')
        .populate('serviceInquired', 'basicInformation.ServiceTitle')
        return res.json(result)
    } catch (error) {
        return res.json({status : "failed", message : error})
    }

    
  };

// handle readchat
module.exports.readChat = async (req,res) => {
    const updatedReadBy = req.body.updatedReadBy
    const conversationId = req.body.conversationIdParam
    const filtered = await chats.find({conversationId})

    const update = {
        $set: {
          'readBy': updatedReadBy, // Replace 'fieldName' with the actual field you want to update
        }
      };

    try {
        const result = await chats.updateMany({conversationId}, update)
        console.log(result)
    } catch (error) {
        return res.error(error)
    }
    
}

// Deletes the conversation
module.exports.deleteConvo = async (req,res) => {
    const {convoId} = req.params
    try {
        const result = await chats.deleteMany({conversationId : convoId})
        return res.json({result})
    } catch (error) {
        return res.json(error)
    }
}
  