const admins = require('../Models/AdminModel')
const category = require("../Models/CategoryModel")
const services = require("../Models/ServiceModel")
const ratings = require("../Models/RatingModel")
const users = require("../Models/UserModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config();

module.exports.Admin_GetUserLists = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken


    const getUsers = async () => {
        try {
            const result = await users.find({}, {password : 0})
            return res.status(200).json(result)
        } catch (error) {
            return res.status(400).json(error)
        }
    }

    if(!accessToken)
    {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    else if(accessToken)
    {
        try {
            jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
                // console.log(err)
              if(err)
              {
                  return res.status(200).json({ error: err, message : "access token invalid" });
              }
              
              getUsers()
            });
          } catch (err) {
            
            if (err.name === 'TokenExpiredError') {
              
              return res.status(401).json({ error: 'Token expired' });
              
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }
    }
}

module.exports.Admin_DisableUser = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {userId} = req.params
  const data = req.body

  const disableUser = async () => {
    try {
      const result = await users.findByIdAndUpdate(userId, { $set: { 'status.status' : "Disabled", 'status.reasons': data.reason } } )
      return res.status(200).json(result.data)
    } catch (error) {
      return res.status(400).json(error)
    }
  }

  if(!accessToken)
    {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    else if(accessToken)
    {
        try {
            jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
              if(err)
              {
                  return res.status(200).json({ error: 'access token expired' });
              }
              
              disableUser()
            });
          } catch (err) {
              
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Token expired' });
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }
    }
}

module.exports.Admin_EnableUser = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {userId} = req.params
  const data = req.body

  const enableUser = async () => {
    try {
      const result = await users.findByIdAndUpdate(userId, { $set: { 'status.status' : "Active", 'status.reasons': [] } } )
      return res.status(200).json(result.data)
    } catch (error) {
      return res.status(400).json(error)
    }
  }

  if(!accessToken)
    {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    else if(accessToken)
    {
        try {
            jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
              if(err)
              {
                  return res.status(200).json({ error: 'access token expired' });
              }
              
              enableUser()
            });
          } catch (err) {
              
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Token expired' });
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }
    }
}