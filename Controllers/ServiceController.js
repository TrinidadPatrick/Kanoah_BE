const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const category = require("../Models/CategoryModel")
const ratings = require('../Models/RatingModel')
const jwt = require('jsonwebtoken')
const DoNotShow = require("../Models/DoNotShowModel")
const favorites = require("../Models/FavoritesModel")
require("dotenv").config();

// Get All Services
module.exports.getServices = async (req,res) =>{
  const accessToken = req.cookies.accessToken
  // If User is loggedout
  if(accessToken == undefined)
  {
  const services = await Service.find()
  .populate('owner', 'firstname lastname profileImage')
  .populate('advanceInformation.ServiceCategory', 'name category_code parent_code')
  .populate({
    path: 'advanceInformation.ServiceSubCategory',
    select: 'name subCategory_code parent_code',
    options: { skipInvalidIds: true } // Skip invalid IDs (e.g., null or non-existent)
  }).select("advanceInformation basicInformation serviceProfileImage tags userId createdAt owner address")
    return res.json(services);
  }

  // If user is loggedIn, get first the dns and favorite and compare
  const getServicesForLoggedInUser = async (userId) => {

    const ratingAverage = (services, dns, ratings) => {
      const processedServices = 
          services.map((service, index) => {
            const currentDate = new Date();
            const thisDate = currentDate.toISOString().split('T')[0];
            const serviceRatings = ratings.filter((rating) => rating.service.toString() === service._id.toString());
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

  
      return processedServices.filter(service => (
          !dns.some(dnsService => service._id.toString() === dnsService.service._id.toString()) &&
          service.owner && 
          service.owner._id.toString() !== userId
        ))
  };
    
    try {
      const services = await Service.find()
      .populate('owner', 'firstname lastname profileImage')
      .populate('advanceInformation.ServiceCategory', 'name category_code parent_code')
      .populate({
        path: 'advanceInformation.ServiceSubCategory',
        select: 'name subCategory_code parent_code',
        options: { skipInvalidIds: true } // Skip invalid IDs (e.g., null or non-existent)
      }).select("advanceInformation basicInformation serviceProfileImage tags userId createdAt owner address")
      
      const dns = await DoNotShow.find({userId : userId})
      .populate(
                {
                  path : 'service',
                  select : 'basicInformation advanceInformation serviceProfileImage owner createdAt ratings',
                  populate : {
                    path : 'owner',
                    model : 'User_Info',
                    select : 'firstname lastname'
  
                  }
                }
      )
      const ratingList = await ratings.find()
      
      const final = ratingAverage(services, dns, ratingList)
      return res.json(final);
        
    } catch (error) {
      return res.status(400).json(error)
    }
  }
  try {
    jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
      if(err)
      {
          return res.status(403).json({ error: 'Forbidden' });
      }
      
      getServicesForLoggedInUser(user._id)
    });
  } catch (err) {
      
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

    
}


// Get Booking History for owner
module.exports.getOwnerBookingHistoryServices = async (req,res) =>{
    
  const services = await Service.find({$or : [{status : "DONE"}, {status : "CANCELLED"}, {status : {$ne : "DELETED"}}]})
  .populate('owner', 'firstname lastname profileImage')
  .populate('advanceInformation.ServiceCategory', 'name category_code parent_code')
  .populate({
    path: 'advanceInformation.ServiceSubCategory',
    select: 'name subCategory_code parent_code',
    options: { skipInvalidIds: true } // Skip invalid IDs (e.g., null or non-existent)
});
    return res.json({service : services});

    
}

// add Service
module.exports.addService = async (req,res) => {
    const basicInformation = req.body.serviceInformation.basicInformation
    const advanceInformation = req.body.serviceInformation.advanceInformation
    const address = req.body.serviceInformation.address
    const serviceHour = req.body.serviceInformation.serviceHour
    const tags  = req.body.serviceInformation.tags
    const userId = req.body.userId
    const createdAt = req.body.createdAt

    const result = await user.findOne({_id : userId})

    const fullname = result.firstname + " " + result.lastname
  
    try {

        const result = await Service.create({userId, owner: userId, basicInformation, advanceInformation, address, serviceHour, tags, createdAt})
        return res.json({result})
    } catch (error) {
        return res.json({status : 0, message : error})
    }
}

// Get Service for profile
module.exports.getService = async (req,res) => {
        const {userId} = req.params

        const getService = async (_id) => {
            if(userId === _id)
            {
                try {
                    const result = await Service.findOne({userId}).populate('owner', 'firstname lastname')
                    return res.json({result})
                } catch (error) {
                    return res.json({status : "failed", message : error})
                }
            }
        }
        

        const accessToken = req.cookies.accessToken
        if (!accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        
          try {
            jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
              if(err)
              {
                  return res.status(403).json({ error: 'Forbidden' });
              }
              
              getService(user._id);
            });
          } catch (err) {
              
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Token expired' });
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }
        
    
}

//get service in the viewService from explore
module.exports.getServiceInfo = async (req,res) => {
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
    
       return res.json({status : "success", service : {
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
      }, ratings : ratingsList}) 
    }


    if(_id){
        try {
            const service = await Service.findById(_id).populate('owner', 'firstname lastname profileImage username')
            computeRatings(service)
            // return res.json({status : "success", service})
        } catch (error) {
            return res.json({status : "failed" , message : error})
        }
    }
    
}

// Update or Add Gallery Images
module.exports.addGalleryImage = async (req,res) => {
    const {_id} = req.params
    const images = req.body.galleryImages

    try {
        const response = await Service.updateOne(
            {_id : _id},
            { $push : {galleryImages : { $each : images}}}
        )

        return res.json({message : response})
    } catch (error) {
        return res.json({message : error})
    }
}

// Get Gallery Images
module.exports.getGalleryImages = async (req,res) => {
    const {userId} = req.params
    try {
        const images = await Service.findOne({userId}).select({galleryImages : 1})

        if(images)
        {
            return res.json({images : images.galleryImages})
        }
        return res.json({message : "no image found"})
    } catch (error) {
        return res.json({message : error})
    }
}

// Delete single image gallery
module.exports.deleteImage = async (req,res) => {
    const imageId = req.body.imageId
    const userId = req.body.userId

    const deleteImage = async (_id) => {
        if(userId === _id)
        {
            try {
                const service = await Service.findOne({userId})
        
                if(!service)
                {
                    return res.json({ success: false, message: 'Service not found' });
                }
        
                const index = service.galleryImages.findIndex(image => image.imageId == imageId)
                const deleted = service.galleryImages.splice(index, 1)
                await service.save()
        
                return res.json({success : true})
            } catch (error) {
                return res.json({message : error})
            }
        }
    }
    

    const accessToken = req.cookies.accessToken
        if (!accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        
          try {
            jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
              if(err)
              {
                  return res.status(403).json({ error: 'Forbidden' });
              }
              
              deleteImage(user._id);
            });
          } catch (err) {
              
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Token expired' });
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }
}

// Delete multiple images from galler
module.exports.deleteMultipleImages = async (req, res) => {
  const userId = req.body.userId;
  const imagesToDelete = req.body.imagesToDelete;

  const deleteMultiple = async (_id) => {
    if(userId === _id)
    {
        try {
            const service = await Service.findOne({ userId });
        
            if (!service) {
              return res.json({ success: false, message: 'Service not found' });
            }
        
            // Filter images to keep only those not in imagesToDelete
            service.galleryImages = service.galleryImages.filter((image) => !imagesToDelete.includes(image.imageId));
        
            // Save the updated service
            await service.save();
        
            return res.json({ success: true });
          } catch (error) {
            return res.json({ success: false, message: error.message });
          }
    }
  }
  

  const accessToken = req.cookies.accessToken
  if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
        if(err)
        {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        deleteMultiple(user._id);
      });
    } catch (err) {
        
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
};

// Update or Add Featured Images
module.exports.addFeaturedImage = async (req,res) => {
    const {_id} = req.params
    const images = req.body.featuredImages

    try {
        const response = await Service.updateOne(
            {_id : _id},
            { $push : {featuredImages : { $each : images}}}
        )
        return res.json({message : response})
    } catch (error) {
        return res.json({message : error})
    }
}

// Get Featured Images
module.exports.getFeaturedImages = async (req,res) => {
    const {userId} = req.params
    try {
        const images = await Service.findOne({userId}).select({featuredImages : 1})
        if(images)
        {
            return res.json({images : images.featuredImages})
        }
        return res.json({message : "no image found"})
    } catch (error) {
        return res.json({message : error})
    }
}

// Delete single image featured
module.exports.deleteFeaturedImage = async (req,res) => {
    const imageId = req.body.imageId
    const userId = req.body.userId

    const deleteImage = async (_id) => {
        if(userId === _id)
        {
            try {
                const service = await Service.findOne({userId})
        
                if(!service)
                {
                    return res.json({ success: false, message: 'Service not found' });
                }
        
                const index = service.featuredImages.findIndex(image => image.imageId == imageId)
                const deleted = service.featuredImages.splice(index, 1)
                await service.save()
        
                return res.json({success : true})
            } catch (error) {
                return res.json({message : error})
            }
        }
    }
   

    const accessToken = req.cookies.accessToken
        if (!accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        
          try {
            jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
              if(err)
              {
                  return res.status(403).json({ error: 'Forbidden' });
              }
              
              deleteImage(user._id);
            });
          } catch (err) {
              
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Token expired' });
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }

    
}

// Delete multiple images from features images
module.exports.deleteMultipleFeaturedImages = async (req, res) => {
    const userId = req.body.userId;
    const imagesToDelete = req.body.imagesToDelete;
    
    const deleteMultiple = async (_id) => {
        if(userId === _id)
        {
            try {
                const service = await Service.findOne({ userId });
            
                if (!service) {
                  return res.json({ success: false, message: 'Service not found' });
                }
            
                // Filter images to keep only those not in imagesToDelete
                service.featuredImages = service.featuredImages.filter((image) => !imagesToDelete.includes(image.imageId));
            
                // Save the updated service
                await service.save();
            
                return res.json({ success: true });
              } catch (error) {
                return res.json({ success: false, message: error.message });
              }
        }
    }
    

    const accessToken = req.cookies.accessToken
        if (!accessToken) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        
          try {
            jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
              if(err)
              {
                  return res.status(403).json({ error: 'Forbidden' });
              }
              
              deleteMultiple(user._id);
            });
          } catch (err) {
              
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Token expired' });
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }
  };

// Update service Profile Picture
module.exports.updateProfilePicture = async (req,res) => {
    const userId = req.body.userId
    const profile = req.body.profile

    try {
        const service = await Service.findOneAndUpdate({userId}, {serviceProfileImage : profile})

        return res.json({status : "success"})

    } catch (error) {
        return res.json({status : "failed" , message : err})
    }
}

// Get Service Info for edit Service
module.exports.getServiceProfile = async (req,res) => {
    const getServiceInfo = async (id) => {
        try {
          const serviceInfo = await Service.findOne({ userId: id })
          .populate('advanceInformation.ServiceCategory', 'name category_code parent_code');
        
        if (serviceInfo && serviceInfo.advanceInformation && serviceInfo.advanceInformation.ServiceSubCategory !== "") {
          // Populate ServiceSubCategory only if it is not an empty string
          await serviceInfo.populate('advanceInformation.ServiceSubCategory', 'name subCategory_code parent_code');
        }
        

          return res.json(serviceInfo);
        } catch (error) {
          return error;
        }
      };
    
      const token = req.cookies.accessToken
  
    
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      try {
        jwt.verify(token, process.env.SECRET_KEY, (err, user)=>{
          if(err)
          {
              return res.status(403).json({ errors: 'Forbidden' });
          }
          getServiceInfo(user._id);
        });
      } catch (err) {
          
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
          
        }
      }
}

// Update the service information
module.exports.updateService = async (req,res)=>{
    
    const {userId} = req.params
    const accessToken = req.cookies.accessToken

    const updateData = req.body
    // Updates the service
    const updateService = async (_id) => {
        if(userId === _id)
        {
            try {
                const updated = await Service.findOneAndUpdate(
                    {userId : userId},
                    {$set : updateData}
                )
                return res.json({status : "Success"})
            } catch (error) {
                return res.status(404).json({error : error})
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
             
              return res.status(403).json({ errors: 'Forbidden' });

          }
          if(user._id === userId)
          {
            updateService(user._id)
          }
        });
      } catch (err) {
         
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
          
        }
      }

}

// Adds  serviceOffer
// module.exports.addServiceOffers = async (req,res) => {

// }
    