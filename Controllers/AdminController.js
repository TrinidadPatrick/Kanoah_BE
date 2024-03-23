const admins = require('../Models/AdminModel')
const category = require("../Models/CategoryModel")
const ratings = require("../Models/RatingModel")
const bookings = require("../Models/BookingModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config();

const generateToken = (user) => {
    return jwt.sign({ _id : user._id, Role : user.Role }, process.env.ADMIN_SECRET_KEY, { expiresIn: '900s' });
}

const generateRefreshToken = (user) => {
    return jwt.sign({ _id : user._id, Role : user.Role }, process.env.ADMIN_REFRESH_SECRET_KEY, { expiresIn: '1day' });
}

module.exports.loginasAdmin = async (req,res) => {
    const UsernameOrEmail = req.body.UsernameOrEmail
    const password = req.body.password
    try {
        const admin = await admins.findOne({ $or : [{username : UsernameOrEmail}, {email : UsernameOrEmail} ], $and : [{ $or : [{Role : "Admin"}, {Role : "SuperAdmin"}]}]})
        
        if(!admin)
        {
            return res.status(404).send({message : "Account not found"})
        }
        const comparePassword = await bcrypt.compare(password, admin.password)
        if(comparePassword)
        {
            const accessToken = generateToken(admin)
            const refreshToken = generateRefreshToken(admin)
            res.cookie('adminAccessToken', accessToken, {secure: true , httpOnly: true , sameSite: 'None',  expires: new Date(Date.now() + 3600000)  });
            res.cookie('adminRefreshToken', refreshToken, {secure: true , httpOnly: true , sameSite: 'None',  expires: new Date(Date.now() + 3600000)  });
            return res.status(200).send({message : "success"})
        }
        return res.status(404).send({message : error})
        
    } catch (error) {
        res.status(404).send({message : error})
    }
}

module.exports.logout = async (req,res) => {
    res.clearCookie('adminAccessToken', { httpOnly: true });
    res.clearCookie('adminRefreshToken', { httpOnly: true });
    return res.status(200).send({message : 'success'})
}

module.exports.addAdmin = async (req,res) => {
    const adminInfo = req.body
    const username = adminInfo.username
    const email = adminInfo.email
    const password = adminInfo.password
    const firstname = adminInfo.firstname
    const lastname = adminInfo.lastname
    const createdAt = adminInfo.createdAt
    const superAdminPassword = req.body.superAdminPassword
    
    const addAdminInfo = async (user) => {
    if(user.Role === "SuperAdmin")
    {
        const checkDuplicateUsername = await admins.findOne({username : username})
    if(checkDuplicateUsername)
    {
        return res.status(409).send({message : 'Username exist'})
    }
    const checkDuplicateEmail = await admins.findOne({email : email})
    if(checkDuplicateEmail)
    {
        return res.status(409).send({message : 'Email exist'})
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newAdmin = await admins.create({username, email, password : hashedPassword, firstname, lastname, createdAt})
        return res.status(200).send({message : "success"})
    } catch (error) {
        return res.status(400).send({message : error})
    }
    }
    
    }

    const accessToken = req.cookies.adminAccessToken
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
              
              addAdminInfo(user)
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

module.exports.UpdateAdmin = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const body = req.body.adminInfo
  const superAdminPassword = req.body.superAdminPassword
  const {_id} = req.params

  const updateAdmin= async (userId) => {

    try {

      const verifyPassword = await admins.findById(userId)
      if(verifyPassword) //IF the superadmin account is found
      {
        const comparePassword = await bcrypt.compare(superAdminPassword, verifyPassword.password) //compares the password
        if(comparePassword) // if superAdmin password is correct
        {
          if(body.password === "")
          {
            const result = await admins.findByIdAndUpdate(_id, { $set : {
              username : body.username,
              firstname : body.firstname, 
              lastname : body.lastname,
              email : body.email
            }})
            return res.status(200).json(result)
          }
          const hashedPassword = await bcrypt.hash(body.password, 10)
          const result = await admins.findByIdAndUpdate(_id, { $set : {
            username : body.username,
            firstname : body.firstname, 
            lastname : body.lastname,
            email : body.email,
            password : hashedPassword
          }})
          return res.status(200).json(result)
        }
        return res.status(400).json({message : "Incorrect Password"})
      }
      return res.status(404).json({message : "Account not found"})

        
      
      
      
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
              
              updateAdmin(user._id)
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

module.exports.DisableAdmin = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {_id} = req.params

  const disableAdmin = async () => {
    try {
      const result = await admins.findByIdAndUpdate(_id, { $set : {status : "Disabled"}})
      if(result)
      {
        return res.status(200).json({message : "Disable successfull"})
      }
      return res.status(404).json({message : "Not Found"})
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
            
            disableAdmin()
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

module.exports.EnableAdmin = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {_id} = req.params

  const enableAdmin = async () => {
    try {
      const result = await admins.findByIdAndUpdate(_id, { $set : {status : "Active"}})
      if(result)
      {
        return res.status(200).json({message : "Disable successfull"})
      }
      return res.status(404).json({message : "Not Found"})
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
            
            enableAdmin()
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
 
module.exports.checkStatus = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken
    
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
              
              return res.status(200).send({status : "authorized"})
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

module.exports.refreshAdmin = async (req,res) => {
    const refreshToken = req.cookies.adminRefreshToken

    if(!refreshToken)
    {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    else if(refreshToken)
    {
        try {
            jwt.verify(refreshToken, process.env.ADMIN_REFRESH_SECRET_KEY, (err, user)=>{
                
              if(err)
              {
                  return res.status(403).json({ error: err });
              }
              const accessToken = generateToken(user)
              res.cookie('adminAccessToken', accessToken, {secure: true , httpOnly: true , sameSite: 'None',  expires: new Date(Date.now() + 3600000)  });
              return res.status(200).json({status : "authorized"})
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

module.exports.getAdminInfo = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken
    const getAdminData = async (admin) => {
        const result = await admins.findById(admin._id).select("username email firstname lastname Role")
        if(result)
        {
            return res.status(200).send(result)
        }

        return res.status(400).send({error : "Not Found"})
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
                  return res.status(403).json({ error: 'Forbidden' });
              }
              
              getAdminData(user)
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

module.exports.getAdmins = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken

    const getAdmins = async (user) => {
        
        if(user.Role === "SuperAdmin")
        {
            try {
                const adminList = await admins.find({Role : "Admin"},  {password : 0})
                if(adminList)
                {
                    return res.status(200).json({adminList})
                }
    
                return res.status(400).json({error : "Not Found"})
            } catch (error) {
                return res.status(400).json({error : error})
            }
            
        }

        return res.status(403).json({ error: 'Forbidden' });
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
              
              getAdmins(user)
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

module.exports.addCategory = async (req,res) => {
    const data = req.body
    const accessToken = req.cookies.adminAccessToken

    const addCategory = async () => {
        try {
            const result = data.map(async(data)=>{
                await category.create({name : data.name, category_code : data.category_code, parent_code : data.parent_code, 
                image : data.image, type : data.type, subCategory_code : data.subCategory_code, createdAt : data.createdAt})
            })
    
            return res.status(200).send(result)
        } catch (error) {
            return res.status(400).send({error : error})
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
              
              addCategory(user)
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

module.exports.getCategories = async (req,res) => {
    try {
        const result = await category.find({status : "Active"})
        if(result)
        {
            return res.status(200).send(result)
        }
    } catch (error) {
        return res.status(400).send({error})
    }
}
module.exports.updateCategories = async (req,res) => {
    const categoryToUpdate = req.body.categoryToUpdate
    const subCategoryToUpdate = req.body.subCategoryToUpdate
    const subCategoryCode = req.body.subCategoryToUpdate[0].subCategory_code
    const accessToken = req.cookies.adminAccessToken
    
    const updateCategory = async () => {
        try {
            // Update existing category
            const updateResult = await category.findOneAndReplace({ category_code: categoryToUpdate.category_code }, categoryToUpdate);
    
            // Delete existing subcategories
            const deleteResult = await category.deleteMany({ subCategory_code: subCategoryCode });
    
            // Insert new subcategories
            const insertResult = await category.insertMany(subCategoryToUpdate);
    
            return res.status(200).send({ success: true, message: 'Categories updated successfully' });
            
        } catch (error) {
             // Log the error for debugging
             console.error('Error updating categories:', error);
    
             // Return an error response
             return res.status(500).send({ success: false, error: 'Internal Server Error' });
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
              
              updateCategory(user)
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

module.exports.editFeatureOption = async (req,res) => {
    const {category_id} = req.params
    const isFeatured = req.body.isFeatured
    const accessToken = req.cookies.adminAccessToken
    const editFeatured = async () => {
        try {
            const result = await category.findByIdAndUpdate(category_id, {$set : {featured : isFeatured}})
            return res.status(200).json(result)
        } catch (error) {
            return res.status(400).json({ error: error });
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
              
              editFeatured(user)
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

module.exports.deleteCategory = async (req,res) => {
    const {category_id} = req.params
    const accessToken = req.cookies.adminAccessToken
    
    const deleteCategory = async () => {
        if(category_id)
    {
        try {
            const result = await category.findByIdAndUpdate(category_id, {$set : {status : "Removed"}})
            return res.status(200).json(result)
        } catch (error) {
            return res.status(400).json(error)
        }
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
              
              deleteCategory(user)
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

module.exports.UpdateSuperAdmin = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const data = req.body


  const updateSuperAdmin = async (user) => {
    if(user.Role === "SuperAdmin")
    {
      try {
        const superAdmin = await admins.findOne({_id : user._id, Role : "SuperAdmin"}) //Find first the super admin
        if(superAdmin)
        {
          console.log(superAdmin)
          const comparePassword = await bcrypt.compare(data.SAPassword, superAdmin.password) //Validate the password of sa SA to the input in the FE
          if(comparePassword)
          {
            if(data.password === "") //If not password was input in the FE
            {
            const result = await admins.findByIdAndUpdate(user._id, {
                  $set : {
                        firstname : data.firstname,
                        lastname : data.lastname,
                  }
                  })
              return res.status(200).json({message : "Update success"})
            }
            const hashedPassword = await bcrypt.hash(data.password, 10)
            const result = await admins.findByIdAndUpdate(user._id, { // If there us a password input in the FE
              $set : {
                    firstname : data.firstname,
                    lastname : data.lastname,
                    password : hashedPassword
              }
              })
          return res.status(200).json({message : "Update success"})
          }
          return res.status(401).json({ error: 'Password incorrect' });
        }
        return res.status(404).json({ error: "Account not found" });
        
      } catch (error) {
        return res.status(400).json({ error: error });
      }
    }
    return res.status(401).json({ error: 'Unauthorized' });
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
              
              updateSuperAdmin(user)
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

module.exports.AdminGetAllBookings = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken

  const getBookings = async (user) => {
      
          try {
              const bookingList = await bookings.find().populate('client', 'firstname lastname')
              .populate('shop', 'basicInformation.ServiceTitle')
              if(bookingList)
              {
                  return res.status(200).json(bookingList)
              }
  
              return res.status(400).json({error : "Not Found"})
          } catch (error) {
              return res.status(400).json({error : error})
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
            
            getBookings(user)
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

module.exports.AdminGetAllReviews = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken

  const getReviews = async (user) => {
      
          try {
              const reviewList = await ratings.find().populate('service', 'basicInformation.ServiceTitle ').populate('user', 'firstname lastname')
              .populate('booking', 'service')
              if(reviewList)
              {
                  return res.status(200).json(reviewList)
              }
  
              return res.status(400).json({error : "Not Found"})
          } catch (error) {
              return res.status(400).json({error : error})
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
            
            getReviews(user)
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