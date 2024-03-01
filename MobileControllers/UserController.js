const user = require('../Models/UserModel')
const bcrypt = require('bcrypt')
const ratings = require('../Models/RatingModel')
const nodemailer = require('nodemailer')
const cookieParser = require('cookie-parser');
const Service = require('../Models/ServiceModel')
require("dotenv").config();
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign({ _id : user._id }, process.env.SECRET_KEY, { expiresIn: '5day' });
}

// Login in
module.exports.Mobile_login = async (req,res) => {
    const UsernameOrEmail = req.body.UsernameOrEmail
    const password = req.body.password

    const result = await user.findOne({ $or : [{username : UsernameOrEmail}, {email : UsernameOrEmail.toLowerCase()} ] })
    if(result != null){
        const comparePassword = await bcrypt.compare(password, result.password)
        if(comparePassword){
            const accessToken = generateToken({ _id : result._id})       
            return res.send({ status: 'authenticated', accessToken })

           
        }else {
            return res.status(401).json({ status: 'invalid username or password' });
        }
   
    }else{
        return res.status(404).json({ status: 'account not found' });
    }
    
}

// Get User Profile
module.exports.Mobile_getUser = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]

    const getuserInfo = async (userId) => {
        try {
          const userInfo = await user.findOne({ _id: userId });
          const { password, ...userInfoWithoutPassword } = userInfo.toObject();
           return res.json(userInfoWithoutPassword);
        } catch (error) {
          return error;
        }
      };

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      try {
        jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
          if(err)
          {
            
              return res.status(403).json({ error: 'Forbidden' });
          }
          
          getuserInfo(user._id);
        });
      } catch (err) {
          
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
            console.log(err)
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

}

