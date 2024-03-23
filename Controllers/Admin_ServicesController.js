const admins = require('../Models/AdminModel')
const category = require("../Models/CategoryModel")
const services = require("../Models/ServiceModel")
const ratings = require("../Models/RatingModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require("dotenv").config();

module.exports.Admin_GetServices = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken

    const getServices = async () => {
        try {
            const result = await services.find().populate('owner', 'firstname lastname profileImage')
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
              if(err)
              {
                  return res.status(200).json({ error: 'access token expired' });
              }
              
              getServices(user)
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

// Gets the service information from the view service admin page
module.exports.Admin_ViewService = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {_id} = req.params

  const computeRatings = async (service) => {
    const ratingsList = await ratings.find({service : service._id}).populate('user', 'firstname lastname profileImage')

    const currentDate = new Date();
    const thisDate = currentDate.toISOString().split('T')[0];
    const totalRatings = ratingsList.length;
    const sumOfRatings = ratingsList.reduce((sum, rating) => sum + rating.rating, 0);
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
  
     return res.status(200).json({status : "success", service : {
      _id : service._id,
      basicInformation: service.basicInformation,
      advanceInformation: service.advanceInformation,
      address: service.address,
      tags: service.tags,
      owner : service.owner,
      serviceProfileImage: service.serviceProfileImage,
      featuredImages : service.featuredImages,
      galleryImages : service.galleryImages,
      serviceHour : service.serviceHour,
      acceptBooking : service.acceptBooking,
      ratings : average.toFixed(1),
      ratingRounded : Math.floor(average),
      totalReviews : totalRatings,
      createdAgo : createdAgo,
      createdAt : service.createdAt,
      serviceOffers : service.serviceOffers,
      status : service.status
    }, ratings : ratingsList}) 
  }

  const getServiceInfo = async () => {
    try {

      const service = await services.findById(_id).populate('owner', 'firstname lastname profileImage username')
      computeRatings(service)
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
              
              getServiceInfo()
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

module.exports.Admin_DisableService = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {serviceId} = req.params
  const data = req.body

  const disableService = async () => {
    try {
      const result = await services.findByIdAndUpdate(serviceId, { $set: { 'status.status' : "Disabled", 'status.reasons': data.reason, 'status.dateDisabled' : new Date() } } )
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
              
              disableService()
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
module.exports.Admin_EnableService = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {serviceId} = req.params

  const disableService = async () => {
    try {
      const result = await services.findByIdAndUpdate(serviceId, { $set: { 'status.status' : "Active", 'status.reasons': [] } } )
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
              
              disableService()
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