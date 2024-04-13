const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const jwt = require('jsonwebtoken')
require("dotenv").config();

// Get Featured Images
module.exports.Mobile_getFeaturedImages = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]
    
    const getFeaturedImages = async (userId) => {
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

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      try {
        jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
          if(err)
          {
            
              return res.status(403).json({ error: 'Forbidden' });
          }
          
          getFeaturedImages(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Update or Add Featured Images
module.exports.Mobile_addFeaturedImage = async (req,res) => {
  const {_id} = req.params
  const images = req.body.featuredImages
  const accessToken = req.headers.authorization.split(' ')[1]
  console.log(images)
  const addFeaturedImage = async () => {
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

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
      if(err)
      {
        
          return res.status(403).json({ error: 'Forbidden' });
      }
      
      addFeaturedImage(user._id)
    });
  } catch (err) {
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  
}

// Delete multiple images from featuered
module.exports.Mobile_deleteMultipleFeaturedImages = async (req, res) => {
  const imageToDelete = req.body.imageToDelete;

  const deleteMultiple = async (_id) => {

        try {
            const service = await Service.findOne({ userId : _id });
        
            if (!service) {
              return res.json({ success: false, message: 'Service not found' });
            }
        
            // Filter images to keep only those not in imagesToDelete
            service.featuredImages = service.featuredImages.filter((image) => !imageToDelete.includes(image.imageId));
        
            // Save the updated service
            await service.save();
        
            return res.json({ success: true });
          } catch (error) {
            return res.json({ success: false, message: error.message });
          }
    
  }
  

  const accessToken = req.headers.authorization.split(' ')[1]
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