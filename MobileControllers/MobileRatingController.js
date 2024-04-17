const ratings = require('../Models/RatingModel')
const bookings = require('../Models/BookingModel')
const jwt = require('jsonwebtoken')

module.exports.Mobile_AddRating = async (req,res) => {
    const {rating, review, service, booking, dateNow} = req.body

    const accessToken = req.headers.authorization.split(' ')[1]

    const addRating = async (userId) =>{
        try {
            const result = await ratings.create({
                booking, rating, service, review, user : userId, createdAt : dateNow
            })

            const updated = await bookings.findOneAndUpdate(
                {_id : booking},
                {$set : {rated : true}}
            )
            

            if(result && updated)
            {
                return res.status(200).json({status : "success"})
            }
        } catch (error) {
            console.log(error)
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
          
          addRating(user._id);
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

module.exports.Mobile_getUserRatings = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]

    const getRatings = async (userId) => {
        try {
            const result = await ratings.find({ user : userId });
            if (result) {
                return res.status(200).json(result);
            }
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            return res.status(500).json({ error: error.message });
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
          
          getRatings(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

module.exports.Mobile_getServiceRatingWithFilter = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
  const dateFilter = req.query.dateFilter
  const service = req.query.service
  

  const getServiceRatings = async () => {
      try {
        const result = await ratings.find({
          service: service,
          createdAt: dateFilter ? {
              $gte: new Date(dateFilter + "-01").toISOString(),
              $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1)).toISOString()
          } : null
      }).populate('user', 'firstname lastname profileImage')
        .populate('booking', 'service');
          if (result) {
              return res.status(200).json(result);
          }
      } catch (error) {
          console.error(error); // Log the error for debugging purposes
          return res.status(500).json({ error: error.message });
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
        
        getServiceRatings()
      });
    } catch (err) {
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
}

module.exports.Mobile_removeRating = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
  const {ratingId} = req.params

  const removeRating = async (userId) => {
    try {
      const result = await ratings.findByIdAndUpdate(ratingId, {$set : {status : "Removed"}})
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json(error)
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
      
      removeRating(user._id)
    });
  } catch (err) {
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

}

module.exports.Mobile_restoreRating = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
  const {ratingId} = req.params

  const removeRating = async (userId) => {
    try {
      const result = await ratings.findByIdAndUpdate(ratingId, {$set : {status : "Active"}})
      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json(error)
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
      
      removeRating(user._id)
    });
  } catch (err) {
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

}