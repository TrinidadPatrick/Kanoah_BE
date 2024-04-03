const user = require('../Models/UserModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const cookieParser = require('cookie-parser');
require("dotenv").config();
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign({ _id : user._id }, process.env.SECRET_KEY, { expiresIn: '5day' });
}

// Get All Users
module.exports.getUsers = async (req,res) =>{
    const accessToken = req.cookies.accessToken
    const users = await user.find()

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      jwt.verify(accessToken, process.env.SECRET_KEY, (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        else
        {
            return res.json(users);
        }
    
        
      });
    
}

// Get specific User
module.exports.getUser = async (req, res) => {
    const accessToken = req.cookies.accessToken

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
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
  };



// Verify Password for update information
module.exports.verifyPassword = async (req,res)=>{
    const id = req.body._id
    const password = req.body.password
    const found = await user.findOne({_id : id})
    if(found != null)
    {
     const comparePassword = await bcrypt.compare(password, found.password)
     if(comparePassword)
     {
        return res.json({status : "verified"})
     }
     else
     {
        return res.json({status : "invalid"})
     }
    }
    
}


// Update user information
module.exports.updateUser = async (req,res) =>{
    const data = req.body
    const accessToken = req.cookies.accessToken
    const _id = req.params._id

    const updateUserInfo = async (userId) => {
        if(userId === _id)
        {
 try {
            // Find duplicates except for the active users information
            const verifyUsername= await user.findOne({username : req.body.username, _id : {$ne : _id}})
            const verifyEmail = await user.findOne({email : req.body.email, _id : {$ne : _id}})
            const verifyContact = await user.findOne({contact : req.body.contact, _id : {$ne : _id}})
            if(verifyUsername){return res.json({status: "usernameDuplicate"})}
            if(verifyEmail){return res.json({status: "emailDuplicate"})}
            if(verifyContact){return res.json({status: "contactDuplicate"})}
            else{
                const result = await user.findByIdAndUpdate(_id, data, {
                    new: true,
                    runValidators: true
                })
                return res.json({data: result, status: "updated" });
            }
    
          
        
        } catch (error) {
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
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
          
          updateUserInfo(user._id)
        });
      } catch (err) {
          
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

    
    
}

// CHECK USERNAME AVAILABILITY
module.exports.verifyUsername = async (req,res) => {
    const username = req.body.username

    const checkUsername = await user.findOne({username : username})

    if(checkUsername == null){
        res.json({status : "available"})
    }else{
        res.json({status : "unavailable"})
    }
}

// Registers the user
module.exports.register = async (req,res) => {  
    const {username, email, password, firstname, lastname, contact, birthDate} = req.body
    const filterContact = await user.findOne({contact : contact})
    const filterEmail = await user.findOne({email : email})
    const filterusername = await user.findOne({username : username})
    const image = `https://ui-avatars.com/api/?name=${firstname}+${lastname}&background=0D8ABC&color=fff`
    if(filterContact){
        return res.json({message : "Contact already Exist"})
    }
    if(filterEmail){
        return res.json({message : "Email already Exist"})
    }if(filterusername) {
        return res.json({message : "Username already Exist"})
    }else if (!filterEmail && !filterusername && !filterContact){
        
        const hashedPassword = await bcrypt.hash(password, 10)
        await user.create({username, email : email.toLowerCase(), password : hashedPassword, firstname, lastname, contact, birthDate : birthDate, profileImage : image, verified : true, Address : null}).then((response)=>{
            const accessToken = generateToken({username : username, email : email.toLowerCase(), _id : response._id})

            res.status(200).json({message : "Registration completed Successfully" , status : "registered", accessToken : accessToken})
        }).catch((err)=>{
            res.send(err)
        })

        
    }

    

   
}

// Update user password
module.exports.updatePassword = async (req,res) => {
    const password = req.body.password
    const newPassword = req.body.newPassword
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    const id = req.body._id
    try {
      const result = await user.findOne({_id : id})  
      if(result != null)
      {
        const verifyPassword = await bcrypt.compare(password, result.password)
        if(verifyPassword)
        {
            await user.findOneAndUpdate({_id : id}, {password : hashedNewPassword})
            return res.json({status : "updated"})
        }
        else
        {
            return res.json({status : "invalid"})
        }
      }
      
    } catch (error) {
        return res.json({error : error})
    }
    
}

// Deactivate Account
module.exports.deactivateAccount = async (req,res)=> {
    const id = req.body._id
    const password = req.body.password
    // Find the user similar to the req id
    const result = await user.findOne({_id : id})
    if(result != null)
    {   
        // Verify if the req password is same as the result password
        const verifyPassword = await bcrypt.compare(password, result.password)
        if(verifyPassword)
        {
            try {
                await user.findOneAndUpdate({_id : id}, {isDeactivated : true})
                return res.json({status : "Deactivated"})
            } catch (error) {
                return res.json({error : error, message : "Connection error, please try again later."})
            }
            
            
        }else
        {
            return res.json({status : "invalid"})
        }

    }
}

// CODE GENERATOR FOR OTP--------------------------------------------------------------------------

    let code = ''
// ------------------------------------------------------------------------------------------------

// FOR EMAIL VERIFICATION SEND OTP EMAIL
module.exports.verifyEmail = async (req,res) => {
    const email = req.body.email
   
    const verifyDuplicateEmail = await user.findOne({email : email.toLowerCase()})
    if(verifyDuplicateEmail){
        res.json({status : "EmailExist"})
    }
    else{
        const letters = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        const arr = []
        for(var i=1; i<7;i++){
            arr.push(letters[Math.floor(Math.random() * letters.length)])
        }
    
        code = arr.join("")
        res.json({status : 'emailSent'})
    const emailTo = req.body.email
    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
          user : process.env.USER,
          pass : process.env.PASS
        },
        tls: {
            rejectUnauthorized: false //Remove when in development
        }
      })

      const email = {
        from: process.env.USER,
        to: emailTo,
        subject: 'Account Verification',
        text: 'Welcome',
        html : `
        <div>
        <p>Please enter this code to verify your account : ${code}</p>
        </div> `
    };

     transporter.sendMail(email, function(error, success){
      if (error) {
          console.log(error);
      } else {
          console.log('Nodemailer Email sent: ' + success.response);
      }
  });
    }
    
}

// OTP VERIFICATION
module.exports.verifyOTP = async (req,res) => {
    const otp = req.body.otp
    if(otp == code){
        res.json({status : "verified"})
        code = ''
    }else{
        res.json({status : "invalid"})
    }
}

// Login in
module.exports.login = async (req,res) => {

    const UsernameOrEmail = req.body.UsernameOrEmail
    const password = req.body.password

    const result = await user.findOne({ $or : [{username : UsernameOrEmail}, {email : UsernameOrEmail.toLowerCase()}] })
    if(result != null){
        if(result.isDeactivated || result.status.status === "Disabled")
        {
            return res.status(404).json({ status: 'account not found' });
        }
        const comparePassword = await bcrypt.compare(password, result.password)
        if(comparePassword){
            const accessToken = generateToken({ _id : result._id})
            res.cookie('accessToken', accessToken, {secure: true , httpOnly: true , sameSite: 'None',  expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)  });           
            return res.send({ status: 'authenticated', accessToken })

           
        }else {
            return res.status(401).json({ status: 'invalid username or password' });
        }
   
    }else{
        return res.status(404).json({ status: 'account not found' });
    }
    
}




// For profile authentication to get profile
module.exports.profile =  (req,res) => {
    
    const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json({status : "logged in", user });
  });
}

// Forgot Password-----------------------------------------------------------------------------FORGOT PASSWORD---------------------------------------
let FPcode = ''
module.exports.forgotPassword = async (req,res) => {
    const email = req.body.email
      const result = await user.findOne({email : email.toLowerCase()})
      if(result != null){

        const letters = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        const arr = []
        for(var i=1; i<7;i++){
        arr.push(letters[Math.floor(Math.random() * letters.length)])
        }
        FPcode = arr.join("")
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
              user : process.env.USER,
              pass : process.env.PASS
            },
            tls: {
                rejectUnauthorized: false //Remove when in development
            }
          })
    
          const email = {
            from: process.env.USER,
            to: result.email,
            subject: 'Password Reset',
            text: 'Welcome',
            html : `
            <div>
            <p>Someone requested a password reset to this account, use this OTP to reset your account. If 
            you did not make this request please change your password now.</p>

            <h2>Code: </h2><br>
            <h1>${FPcode}</h1>
            </div> `
        };
    
         transporter.sendMail(email, function(error, success){
          if (error) {
              console.log(error);
          } else {
              console.log('Nodemailer Email sent: ' + success.response);
              
          }
      });
      res.json({message : "Found"})
      }else{
        res.json({message : "Account not found"})
      }
}

// Submitted OTP for verification
module.exports.submitOtpForNewPassword = async (req,res)=>{
   
    const otp = req.body.code
    if(otp == ""){
        res.json({status : "invalid"})
    }
    else if(FPcode == otp){
        res.json({status : "verified"})
        FPcode = ''
    }
    else{
        res.json({status : "invalid"})
    }
}

// New Password from forget password
module.exports.newPassword = async (req,res) => {
    const password = req.body.password
    const email = req.body.email
    const hashedPassword = await bcrypt.hash(password, 10)

    const updatePassword = await user.findOneAndUpdate({email : email.toLowerCase()}, {password : hashedPassword})
    if(updatePassword){
        res.json({status : "updated"})
    }else {
        res.json({status : "failed"})
    }
}

module.exports.userLogout = async (req,res) => {
    res.cookie('accessToken', null, {secure: true , httpOnly: true , sameSite: 'None',maxAge: -1  });   
    return res.status(200).send({message : 'success'})
}

