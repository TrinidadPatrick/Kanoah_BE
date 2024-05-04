const bookings = require('../Models/BookingModel')
const service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require("dotenv").config();

// get all the booking schedule of a service
module.exports.getBookingSchedules = async (req,res) => {
    const {shop_id} = req.params
    try {
        const result = await bookings.find({shop : shop_id, status : "INPROGRESS"}).select("schedule")
        if(result)
        {
            res.status(200).json(result)
        }
    } catch (error) {
        return res.status(400).send({error})
    }
}

// Sends a receipt to the client with the booking details
module.exports.sendBookingReceipt = async (req,res) => {
  const emailTo = req.body.email
  const html = req.body.html
  const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth : {
    user : process.env.USER,
    pass : process.env.PASS
  },
  tls: {
      rejectUnauthorized: false //Remove when in development
  }
  })

  const email = {
    from: process.env.USER,
    to: emailTo,
    subject: 'Your Kanoah E-Receipt',
    text: 'Welcome',
    html : html
  };

  transporter.sendMail(email, function(error, success){
    if (error) {
        console.log(error);
    } else {
        console.log('Nodemailer Email sent: ' + success.response);
    }
})
}

// insert booking information
module.exports.addBooking = async (req,res) => {
    const data = req.body
    try {
        const result = await bookings.create({shop : data.shop, service : data.service, schedule : data.schedule, 
        contactAndAddress : data.contactAndAddress, createdAt : data.createdAt, booking_id : data.booking_id, service_fee : data.service_fee, booking_fee : data.booking_fee , net_Amount : data.net_Amount, client : data.client 
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
module.exports.CLIENT_getInProgressBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "INPROGRESS"}, {status : {$ne : "DELETED"}}]})
            .populate('shop', 'serviceProfileImage basicInformation owner cancelationPolicy')
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
module.exports.CLIENT_getCompletedBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const getBookingInfo = async (_id) => {
        try {
            const result = await bookings.find({client : _id, $and : [{status : "COMPLETED"}, {status : {$ne : "DELETED"}}]}).sort({ createdAt: -1 })
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
module.exports.CLIENT_getCancelledBooking = async (req,res) => {
    const accessToken = req.cookies.accessToken
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
            const result = await bookings.find({$and: [{ client : _id },{$or: [{ status: "COMPLETED" },{ status: "CANCELLED" }]},{ status: { $ne: "DELETED" } }]})
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
module.exports.getInProgressBooking = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({shop: _id, $and: [{ status: "INPROGRESS" },{ status: { $ne: "DELETED" } }]})
        .populate('shop', 'serviceProfileImage basicInformation owner')
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}

// get Accepted bookings for specific user
module.exports.getCompletedBooking = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({shop: _id, $and: [{ status: "COMPLETED" },{ status: { $ne: "DELETED" } }]})
        
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}
// get History of bookings for specific user
module.exports.getBookingHistory = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({$and: [{ shop: _id },{$or: [{ status: "COMPLETED" },{ status: "CANCELLED" }]},{ status: { $ne: "DELETED" } }]})
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({error})
    }
}
// get Rejected bookings for specific user
module.exports.getCancelledBooking = async (req,res) => {
    const {_id} = req.params

    try {
        const result = await bookings.find({shop: _id, $and: [{ status: "CANCELLED" },{ status: { $ne: "DELETED" } }]})
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