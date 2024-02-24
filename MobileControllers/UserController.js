const user = require('../Models/UserModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const cookieParser = require('cookie-parser');
require("dotenv").config();
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign({ _id : user._id }, process.env.SECRET_KEY, { expiresIn: '5day' });
}

// Login in
module.exports.Mobile_login = async (req,res) => {

    const UsernameOrEmail = req.body.UsernameOrEmail
    const password = req.body.password


    const result = await user.findOne({ $or : [{username : UsernameOrEmail}, {email : UsernameOrEmail} ] })
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