const DoNotShow = require("../Models/DoNotShowModel")
const favorites = require("../Models/FavoritesModel")
const jwt = require("jsonwebtoken")

module.exports.Mobile_addToDoNotShow = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
  const serviceId = req.body.serviceId
  const createdAt = req.body.createdAt

  console.log(req.body)

  const addDNS = async (userId) => {
      try {
              const check_favorite_list = await favorites.findOneAndDelete({service : serviceId}) //checks and remove id there is related data in the favorite list
              const isExising = await DoNotShow.findOne({service : serviceId})
              if(!isExising)
              {
                const result = await DoNotShow.create({userId : userId, service : serviceId, createdAt})
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
        
        addDNS(user._id)
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
}

module.exports.Mobile_getDoNotShow = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]

    const getDNS = async (userId) => {
        try {
            const result = await DoNotShow.find({userId : userId})
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
          
          getDNS(user._id);
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

module.exports.Mobile_removeDoNotShow = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]
    const {serviceId} = req.params
    const removeDNS = async (userId) => {
        try {
            const result = await DoNotShow.findOneAndDelete({userId, service : serviceId})
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
          
          removeDNS(user._id);
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