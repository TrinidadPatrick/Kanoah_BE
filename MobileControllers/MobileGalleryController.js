const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const jwt = require('jsonwebtoken')
require("dotenv").config();

// Get Gallery Images
module.exports.Mobile_getGalleryImages = async (req,res) => {
    
  const accessToken = req.headers.authorization.split(' ')[1]
    
    const getGalleryImages = async (userId) => {
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

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      try {
        jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
          if(err)
          {
            
              return res.status(403).json({ error: 'Forbidden' });
          }
          
          getGalleryImages(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Update or Add Gallery Images
module.exports.Mobile_addGalleryImage = async (req,res) => {
  const {_id} = req.params
  const images = req.body.galleryImages
  const accessToken = req.headers.authorization.split(' ')[1]
  const addGalleryImage = async () => {
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

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    jwt.verify(accessToken, process.env.SECRET_KEY, (err, user)=>{
      if(err)
      {
        
          return res.status(403).json({ error: 'Forbidden' });
      }
      
      addGalleryImage(user._id)
    });
  } catch (err) {
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  
}

// Delete multiple images from gallery
module.exports.Mobile_deleteMultipleImages = async (req, res) => {
  const imageToDelete = req.body.imageToDelete;

  const deleteMultiple = async (_id) => {

        try {
            const service = await Service.findOne({ userId : _id });
        
            if (!service) {
              return res.json({ success: false, message: 'Service not found' });
            }
        
            // Filter images to keep only those not in imagesToDelete
            service.galleryImages = service.galleryImages.filter((image) => !imageToDelete.includes(image.imageId));
        
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