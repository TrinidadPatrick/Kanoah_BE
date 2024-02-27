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

// Get Top Rated Services
module.exports.Mobile_GetServices = async (req,res) => {
    const computeRatings = async (services) => {
        try {
            const ratingList = await ratings.find()

                const processedServices = 
                    services.map((service, index) => {
                        const currentDate = new Date();
                        const thisDate = currentDate.toISOString().split('T')[0];
                        const serviceRatings = ratingList.filter((rating) => rating.service.toString() === service._id.toString());
                        const totalRatings = serviceRatings.length;
                        const sumOfRatings = serviceRatings.reduce((sum, rating) => sum + rating.rating, 0);
                        const average = totalRatings === 0 ? 0 : sumOfRatings / totalRatings;
                        const from = new Date(service.createdAt);
                        const timeDifference = currentDate - from;
                        const seconds = Math.floor(timeDifference / 1000);
                        const minutes = Math.floor(seconds / 60);
                        const hours = Math.floor(minutes / 60);
                        const days = Math.floor(hours / 24);
                        const months = Math.floor(days / 30);
                        const years = Math.floor(months / 12);
                        const createdAgo = years > 0 ? `${years} year${years > 1 ? 's' : ''} ago` : months > 0 ? `${months} month${months > 1 ? 's' : ''} ago` : days > 0 ? `${days} day${days > 1 ? 's' : ''} ago` : hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ago` : minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : 'Less than a minute ago';

                      return {
                        _id : service._id,
                        key : index,
                        basicInformation: service.basicInformation,
                        advanceInformation: service.advanceInformation,
                        address: service.address,
                        tags: service.tags,
                        owner : service.owner,
                        serviceProfileImage: service.serviceProfileImage,
                        ratings : average.toFixed(1),
                        ratingRounded : Math.floor(average),
                        totalReviews : totalRatings,
                        createdAgo : createdAgo,
                        createdAt : service.createdAt
                      }
                    })
                    return res.json(processedServices);
            
        } catch (error) {
            return res.status(500).json({error})
        }
        
    }

    const getServices = async (userId) => {
        try {
          const services = await Service.find();
          computeRatings(services)
        } catch (error) {
          return error;
        }
      };

   
      getServices()
}