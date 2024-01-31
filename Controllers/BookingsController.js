const bookings = require('../Models/BookingModel')
const service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const jwt = require('jsonwebtoken')

// get all the booking schedule of a service
module.exports.getBookingSchedules = async (req,res) => {
    const {shop_id} = req.params
    try {
        const result = await bookings.find({shop : shop_id}).select("schedule")
        if(result)
        {
            res.status(200).json(result)
        }
    } catch (error) {
        return res.status(400).send({error})
    }
}

// insert booking information
module.exports.addBooking = async (req,res) => {
    const data = req.body
    try {
        const result = await bookings.create({shop : data.shop, service : data.service, schedule : data.schedule, 
        contactAndAddress : data.contactAndAddress, createdAt : data.createdAt, Booking_id : data.booking_id, service_fee : data.service_fee, booking_fee : data.booking_fee , client : data.client 
        })
        if(result)
        {
            res.status(200).json(result)
        }
    } catch (error) {
        return res.status(400).send({error})
    }
}

// get pending bookings for specific user
module.exports.CLIENT_getPendingBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "PENDING"}, {status : {$ne : "DELETED"}}]})
            .populate('shop', 'serviceProfileImage')
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
          
          getBookingInfo(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// get topay bookings for specific user
module.exports.CLIENT_getToPayBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "ToPay"}, {status : {$ne : "DELETED"}}]})
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
          
          getBookingInfo(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// get Accepted bookings for specific user
module.exports.CLIENT_getAcceptedBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "ACCEPTED"}, {status : {$ne : "DELETED"}}]})
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
          
          getBookingInfo(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// get Rejected bookings for specific user
module.exports.CLIENT_getRejectedBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "REJECTED"}, {status : {$ne : "DELETED"}}]})
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
          
          getBookingInfo(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// get History of bookings for specific user
module.exports.CLIENT_getHistoryBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({$and: [{ client : _id },{$or: [{ status: "DONE" },{ status: "CANCELLED" }]},{ status: { $ne: "DELETED" } }]})
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
          
          getBookingInfo(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}



// For OWNER OR SERVICE PROVIDER
// get Pending bookings for specific user
module.exports.getPendingBooking = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({shop: _id, $and: [{ status: "PENDING" },{ status: { $ne: "DELETED" } }]})
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}
module.exports.getPendingPaymentBooking = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({shop: _id, $and: [{ status: "ToPay" },{ status: { $ne: "DELETED" } }]})
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}
// get Accepted bookings for specific user
module.exports.getAcceptedBooking = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({shop: _id, $and: [{ status: "ACCEPTED" },{ status: { $ne: "DELETED" } }]})
        
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}
// get History of bookings for specific user
module.exports.getBookingHistory = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({$and: [{ shop: _id },{$or: [{ status: "DONE" },{ status: "CANCELLED" }]},{ status: { $ne: "DELETED" } }]})
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}
// get Rejected bookings for specific user
module.exports.getRejectedBooking = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({shop: _id, $and: [{ status: "REJECTED" },{ status: { $ne: "DELETED" } }]})
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}

// Accepts or rejects the booking request of the client
module.exports.respondBooking = async (req,res) => {
    const {_id} = req.params
    const updateField = req.body

    try {
        const result = await bookings.findByIdAndUpdate(_id, {$set : updateField}, {new : true})

        if (!result) {
            return res.status(404).json({ error: 'Document not found' });
          }
      
          res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}