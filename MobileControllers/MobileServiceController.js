const user = require('../Models/UserModel')
const bcrypt = require('bcrypt')
const ratings = require('../Models/RatingModel')
const nodemailer = require('nodemailer')
const cookieParser = require('cookie-parser');
const Service = require('../Models/ServiceModel')
require("dotenv").config();
const jwt = require('jsonwebtoken')

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

// Get services by filter and search in Explore
module.exports.Mobile_GetServicesByFilter = async (req,res) => {
    const categoryId = req.query.category === undefined ? '' : req.query.category
    const subCategoryId = req.query.subCategory === undefined ? '' : req.query.subCategory
    const ratingsFilter = req.query.ratings.length === 0 ? [] : req.query.ratings.split(",")
    const searchValue = req.query.search
    const latitude = req.query.latitude
    const longitude = req.query.longitude
    const radius = req.query.radius

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
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
                    return processedServices
            
        } catch (error) {
            return res.status(500).json({error})
        }
        
    }

    const getServices = async () => {
      // Meaning there is no rating filter specified
      if(ratingsFilter.length === 0)
      {
        try {
          if(latitude == 0 && longitude == 0) //If the user didnt specify or turn on gps
          {
            const services = await Service.find({
              'advanceInformation.ServiceCategory': categoryId !== '' ? categoryId : {$exists: true},
              'advanceInformation.ServiceSubCategory': subCategoryId !== '' ? subCategoryId : {$exists: true},
              $or: [
                {
                  'basicInformation.ServiceTitle': {
                    $regex: new RegExp(searchValue.toLowerCase(), 'i')
                  }
                },
                {
                  tags: {
                    $regex: new RegExp(searchValue.toLowerCase(), 'i')
                  }
                },
                { 'basicInformation.ServiceTitle': searchValue === '' ? {$exists: true} : null }
              ]
            });  
            const computed = await computeRatings(services)
            return res.json({services : computed})
          }
          const services = await Service.find({
            'advanceInformation.ServiceCategory': categoryId !== '' ? categoryId : {$exists: true},
            'advanceInformation.ServiceSubCategory': subCategoryId !== '' ? subCategoryId : {$exists: true},
            'address.latitude' : {
              $gte: lat - (Number(radius) / 111), // Latitude range for approximately 1km in degrees
              $lte: lat + (Number(radius) / 111),
            } ,
            'address.longitude':  {
              $gte: lon - (Number(radius) / (111 * Math.cos(lat * (Math.PI / 180)))), // Longitude range adjusted for latitude
              $lte: lon + (Number(radius) / (111 * Math.cos(lat * (Math.PI / 180)))),
            },
            $or: [
              {
                'basicInformation.ServiceTitle': {
                  $regex: new RegExp(searchValue.toLowerCase(), 'i')
                }
              },
              {
                tags: {
                  $regex: new RegExp(searchValue.toLowerCase(), 'i')
                }
              },
              { 'basicInformation.ServiceTitle': searchValue === '' ? {$exists: true} : null }
            ]
          });  
          const computed = await computeRatings(services)
          
          return res.json({services : computed})
        } catch (error) {
          return error;
        }
      }
      else
      {
        try {
          if(latitude == 0 && longitude == 0)
          {
            const services = await Service.find({
              'advanceInformation.ServiceCategory': categoryId !== '' ? categoryId : {$exists: true},
              'advanceInformation.ServiceSubCategory': subCategoryId !== '' ? subCategoryId : {$exists: true},
              'address.latitude' : {
                $gte: lat - (Number(radius) / 111), // Latitude range for approximately 1km in degrees
                $lte: lat + (Number(radius) / 111),
              } ,
              'address.longitude':  {
                $gte: lon - (Number(radius) / (111 * Math.cos(lat * (Math.PI / 180)))), // Longitude range adjusted for latitude
                $lte: lon + (Number(radius) / (111 * Math.cos(lat * (Math.PI / 180)))),
              },
              $or: [
                {
                  'basicInformation.ServiceTitle': {
                    $regex: new RegExp(searchValue.toLowerCase(), 'i')
                  }
                },
                { 'basicInformation.ServiceTitle': searchValue === '' ? {$exists: true} : null }
              ]
            });  
            const computed = await computeRatings(services)
            const filtered = computed.filter((service) => ratingsFilter.some((ratings) => Number(service.ratings) >= Number(ratings) && Number(service.ratings)  < Number(ratings) + 1))
            return res.json({services : filtered})
          }
          const services = await Service.find({
            'advanceInformation.ServiceCategory': categoryId !== '' ? categoryId : {$exists: true},
            'advanceInformation.ServiceSubCategory': subCategoryId !== '' ? subCategoryId : {$exists: true},
            $or: [
              {
                'basicInformation.ServiceTitle': {
                  $regex: new RegExp(searchValue.toLowerCase(), 'i')
                }
              },
              { 'basicInformation.ServiceTitle': searchValue === '' ? {$exists: true} : null }
            ]
          });  
          const computed = await computeRatings(services)
          const filtered = computed.filter((service) => ratingsFilter.some((ratings) => Number(service.ratings) >= Number(ratings) && Number(service.ratings)  < Number(ratings) + 1))
          return res.json({services : filtered})
          
        } catch (error) {
          return error;
        }
      }
        
      };

   
      getServices()
}