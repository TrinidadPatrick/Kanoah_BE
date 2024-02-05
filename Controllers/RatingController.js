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