const bookings = require('../Models/BookingModel')
const service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const jwt = require('jsonwebtoken')

// get pending bookings for specific user
module.exports.Mobile_CLIENT_getInProgressBooking = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "INPROGRESS"}, {status : {$ne : "DELETED"}}]})
            .populate('shop', 'serviceProfileImage basicInformation owner')
            return res.status(200).send(result)
        } catch (error) {
            return res.status(400).send({error})
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
          
          getBookingInfo(user._id);
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

// get Accepted bookings for specific user
module.exports.Mobile_CLIENT_getCompletedBooking = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "COMPLETED"}, {status : {$ne : "DELETED"}}]})
            .populate('shop', 'serviceProfileImage basicInformation owner')
            return res.status(200).send(result)
        } catch (error) {
            return res.status(400).send({error})
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
          
          getBookingInfo(user._id);
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

// get Cancelled bookings for specific user
module.exports.Mobile_CLIENT_getCancelledBooking = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "CANCELLED"}, {status : {$ne : "DELETED"}}]})
            .populate('shop', 'serviceProfileImage basicInformation owner')
            return res.status(200).send(result)
        } catch (error) {
            return res.status(400).send({error})
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
          
          getBookingInfo(user._id);
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