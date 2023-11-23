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
    const message = data.messages

    //check if the conversation between user is existing
    const checkChatExisting = await chats.findOne({conversationId : req.body.conversationId})
    
    // If conversation id is existing, create a new document with the conversation id same as the existing one
    if(checkChatExisting != null)
    {
        try {
            const result = await chats.create({conversationId : existingConversationId, participants, message})
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : error})
        }
    }
    // if conversation id is not existing, create a new document with a new conversation id
    else
    {
        try {
            const result = await chats.create({conversationId, participants, message})
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
        const result = await chats.find({participants : {$all: [userId]}}).populate('message.sender', 'username')
        .populate('message.receiver', 'username')
        .populate('participants', 'username')
        return res.json(result)
    } catch (error) {
        return res.json({status : "failed", message : error})
    }

    
  };
  