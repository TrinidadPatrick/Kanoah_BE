const favorites = require("../Models/FavoritesModel")
const jwt = require("jsonwebtoken")

module.exports.addFavorites = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const serviceId = req.body.serviceId
    const createdAt = req.body.createdAt

    const addFavorite = async (id) => {
        try {
            const result = await favorites.create({userId : id, service : serviceId, createdAt})
            console.log("Hello")
            if(result)
            {
                return res.status(200).send({status : "success"})
            }
        } catch (error) {
            return res.status(500).json({ error: error })
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
          
          addFavorite(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

module.exports.getFavorites = async (req,res) => {
    const accessToken = req.cookies.accessToken

    const getFavorite = async (userId) => {
        try {
            const result = await favorites.find({userId : userId})
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
            if(result)
            {
                return res.status(200).json(result)
            }
            return res.status(500).json({ error: error });
        } catch (error) {
            return res.status(500).json({ error: error });
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
          
          getFavorite(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

module.exports.removeFavorites = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const {serviceId} = req.params

    const removeFavorite = async (userId) => {
        try {
            const result = await favorites.findOneAndDelete({userId, service : serviceId})
            if(result)
            {
                return res.status(200).json({message : "removed"})
            }
        } catch (error) {
            return res.status(500).json({ error: error });
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
          
          removeFavorite(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}