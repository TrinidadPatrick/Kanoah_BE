const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const category = require("../Models/CategoryModel")
const jwt = require('jsonwebtoken')
require("dotenv").config();

// Get All Services
module.exports.getServices = async (req,res) =>{
    
  const services = await Service.find()
  .populate('owner', 'firstname lastname profileImage')
  .populate('advanceInformation.ServiceCategory', 'name category_code parent_code')
  .populate({
    path: 'advanceInformation.ServiceSubCategory',
    select: 'name subCategory_code parent_code',
    options: { skipInvalidIds: true } // Skip invalid IDs (e.g., null or non-existent)
}).select("advanceInformation basicInformation ratings serviceProfileImage tags userId createdAt owner address")
    return res.json({service : services});

    
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
    if(_id){
        try {
            const service = await Service.findById(_id).populate('owner', 'firstname lastname profileImage username')
            return res.json({status : "success", service})
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
    