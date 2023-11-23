const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
require("dotenv").config();

// Get All Services
module.exports.getServices = async (req,res) =>{
    const services = await Service.find().populate('owner', 'firstname lastname')
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
  
    console.log(result)
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
        try {
            const result = await Service.findOne({userId}).populate('owner', 'firstname lastname')
            return res.json({result})
        } catch (error) {
            return res.json({status : "failed", message : err})
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

// Delete multiple images from galler
module.exports.deleteMultipleImages = async (req, res) => {
  const userId = req.body.userId;
  const imagesToDelete = req.body.imagesToDelete;

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
        console.log(images)
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

// Delete multiple images from galler
module.exports.deleteMultipleFeaturedImages = async (req, res) => {
    const userId = req.body.userId;
    const imagesToDelete = req.body.imagesToDelete;
  
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
    