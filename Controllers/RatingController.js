const ratings = require('../Models/RatingModel')
const bookings = require('../Models/BookingModel')
const jwt = require('jsonwebtoken')

module.exports.AddRating = async (req,res) => {
    const {rating, review, service, booking, dateNow} = req.body

    const accessToken = req.cookies.accessToken

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
          
          addRating(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

module.exports.getAllRatings = async (req,res) => {
    try {
        const result = await ratings.find()
        if(result)
        {
            return res.status(200).json(result)
        }
    } catch (error) {
        return res.status(500).json({error})
    }
}

module.exports.getUserRatings = async (req,res) => {
    const accessToken = req.cookies.accessToken

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

module.exports.getServiceRatingWithFilter = async (req,res) => {
  const accessToken = req.cookies.accessToken
  const dateFilter = req.query.dateFilter
  const service = req.query.service
  const getServiceRatings = async () => {
      try {
        const result = await ratings.find({
          service: service,
          createdAt: dateFilter ? {
            $gte: new Date(dateFilter + "-01"),
            $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
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

module.exports.getServiceRatings = async (req,res) => {
  const accessToken = req.cookies.accessToken
  const {service} = req.params

  const getServiceRatings = async () => {
      try {
          const result = await ratings.find({ service : service }).populate('user', 'firstname lastname profileImage')
          .populate('booking', 'service')
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

module.exports.removeRating = async (req,res) => {
  const accessToken = req.cookies.accessToken
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

module.exports.restoreRating = async (req,res) => {
  const accessToken = req.cookies.accessToken
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