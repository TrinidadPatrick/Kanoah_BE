const Service = require('../Models/ServiceModel')
const user = require('../Models/UserModel')
const ratings = require('../Models/RatingModel')
const bookings = require('../Models/BookingModel')
const jwt = require('jsonwebtoken')

// Get total booking count
module.exports.countBookings = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service
    const dateFilter = req.query.dateFilter

    const countBookings = async (userId) => {
        try {
            const thisMonth = await bookings.countDocuments({
                shop: service,
                createdAt: dateFilter ? {
                  $gte: new Date(dateFilter + "-01"),
                  $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
                } : null
              })

               // Calculate the start date of the previous month
               const prevMonthStart = new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() - 1));

               // Calculate the end date of the previous month
               const prevMonthEnd = new Date(dateFilter + "-01");

               const prevMonth = await ratings.countDocuments({
                   service: service,
                   createdAt: dateFilter ? {
                   $gte: prevMonthStart,
                   $lt: prevMonthEnd
                   } : null
               });
               const percentIncrease = ((thisMonth - prevMonth) / prevMonth) * 100
               return res.status(200).json({ thisMonth, percentIncrease });

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
          
          countBookings(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Get total Review count
module.exports.countRatings = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service
    const dateFilter = req.query.dateFilter

    // console.log(dateFilter)
    const countRating = async (userId) => {
        try {
            const thisMonth = await ratings.countDocuments({
                service: service,
                createdAt: dateFilter ? {
                  $gte: new Date(dateFilter + "-01"),
                  $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
                } : null
              })

               // Calculate the start date of the previous month
                const prevMonthStart = new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() - 1));

                // Calculate the end date of the previous month
                const prevMonthEnd = new Date(dateFilter + "-01");

                const prevMonth = await ratings.countDocuments({
                    service: service,
                    createdAt: dateFilter ? {
                    $gte: prevMonthStart,
                    $lt: prevMonthEnd
                    } : null
                });
                const percentIncrease = ((thisMonth - prevMonth) / prevMonth) * 100
                return res.status(200).json({ thisMonth, percentIncrease });
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
          
          countRating(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Get the average ratings
module.exports.getRatingAverage = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service
    const dateFilter = req.query.dateFilter

    const getAverage = async (userId) => {
        try {
            const thisMonth = await ratings.find({
                service: service,
                createdAt: dateFilter ? {
                  $gte: new Date(dateFilter + "-01"),
                  $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
                } : null
            })
            const totalRatings = thisMonth.length
            const sumOfRatings = thisMonth.reduce((sum, rating) => sum + rating.rating, 0);
            const average = totalRatings === 0 ? 0 : sumOfRatings / totalRatings

            // Calculate the start date of the previous month
            const prevMonthStart = new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() - 1));

            // Calculate the end date of the previous month
            const prevMonthEnd = new Date(dateFilter + "-01");

            const prevMonth = await ratings.find({
                service: service,
                createdAt: dateFilter ? {
                $gte: prevMonthStart,
                $lt: prevMonthEnd
                } : null
            });

            const prevTotalRatings = prevMonth.length
            const prevSumOfRatings = prevMonth.reduce((sum, rating) => sum + rating.rating, 0);
            const prevAverage = prevTotalRatings === 0 ? 0 : prevSumOfRatings / prevTotalRatings

            const percentIncrease = ((average - prevAverage) / prevAverage) * 100

            return res.status(200).json({averageThisMonth : average.toFixed(1), percentIncrease})
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
          
          getAverage(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Get total Sales
module.exports.getTotalSales = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service
    const dateFilter = req.query.dateFilter

    const getTotalSales = async (userId) => {
        try {
            const thisMonth = await bookings.find({
                shop : service,
                createdAt: dateFilter ? {
                  $gte: new Date(dateFilter + "-01"),
                  $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
                } : null
            })
            const sales = thisMonth.reduce((sum, booking) => sum + Number(booking.service.price), 0)

            // Calculate the start date of the previous month
            const prevMonthStart = new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() - 1));

            // Calculate the end date of the previous month
            const prevMonthEnd = new Date(dateFilter + "-01");

            const prevMonth = await bookings.find({
                shop: service,
                createdAt: dateFilter ? {
                $gte: prevMonthStart,
                $lt: prevMonthEnd
                } : null
            });

            const prevSales = prevMonth.reduce((sum, booking) => sum + Number(booking.service.price), 0)

            const percentIncrease = prevSales === 0 ? 0 : ((sales - prevSales) / prevSales) * 100
            return res.status(200).json({sales : sales.toLocaleString(), percentIncrease : percentIncrease.toFixed(1)})
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
          
          getTotalSales(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Get total sales each Month
module.exports.getMonthlySales = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service
    const dateFilter = req.query.dateFilter

    const getTotalSales = async (userId) => {
        try {
            const thisMonth = await bookings.find({
                shop : service,
            })
            const sales = thisMonth.reduce((sum, booking) => sum + Number(booking.service.price), 0)

           
            return res.status(200).json(thisMonth)
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
          
          getTotalSales(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Get total sales each Month
module.exports.getMonthlyBookings = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service

    const getTotalSales = async (userId) => {
        try {
            const thisMonth = await bookings.find({
                shop : service,
            })

           
            return res.status(200).json(thisMonth)
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
          
          getTotalSales(user._id)
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Get Bookings by filter
module.exports.getDBBookings = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service
    const filter = req.query.filter
    const dateFilter = req.query.dateFilter

    const filterValue = filter.toUpperCase()

    const getBookings = async (userId) => {
        try {
            if(filter === "All Bookings")
            {
                const result = await bookings.find({
                    shop : service,
                    createdAt: dateFilter ? {
                        $gte: new Date(dateFilter + "-01"),
                        $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
                      } : null
                }).populate('client', 'firstname lastname')

                return res.status(200).json(result)
            }
            else
            {
                const result = await bookings.find({
                    shop : service,
                    status : filterValue,
                    createdAt: dateFilter ? {
                        $gte: new Date(dateFilter + "-01"),
                        $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
                      } : null
                }).populate('client', 'firstname lastname')
                return res.status(200).json(result)
            }
            
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
          
          getBookings()
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

// Get All service Offers
module.exports.getDBServiceOffers = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const service = req.query.service
    const dateFilter = req.query.dateFilter

    const getServiceOffers = async () => {
        try {
            const serviceOffers = await Service.findById(service).select('serviceOffers')
            const bookingResult = await bookings.find({shop : service,
                createdAt: dateFilter ? {
                    $gte: new Date(dateFilter + "-01"),
                    $lt: new Date(new Date(dateFilter + "-01").setMonth(new Date(dateFilter + "-01").getMonth() + 1))
                  } : null
            }).select('service')
            return res.status(200).json({serviceOffers, bookingResult})
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
          
          getServiceOffers()
        });
      } catch (err) {
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}