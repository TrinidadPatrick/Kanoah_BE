const notifications = require('../Models/NotificationModel')
const jwt = require('jsonwebtoken')

module.exports.Mobile_getNotifications = async (req,res) => {

    const accessToken = req.headers.authorization.split(' ')[1]
    const page = req.query.page || 1
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const getNotif = async (userId) => {
        try {
            const result = await notifications.find({notif_to : userId}).sort({ createdAt: -1 }).skip(skip).limit(pageSize)

            if(result)
            {
                return res.status(200).json(result)
            }
        } catch (error) {
            return res.status(500).json({message : error})
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
          
          getNotif(user._id)
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

module.exports.Mobile_markAsRead = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
  const notification_id = req.body.notification_id

  const markAsRead = async (userId) => {
      try {
          const result = await notifications.findOneAndUpdate({_id : notification_id, notif_to : userId}, { $set : {isRead : true}}, {new : true})

              return res.status(200).json(result)
          
      } catch (error) {
          return res.status(500).json({message : error})
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
        
        markAsRead(user._id)
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
}

module.exports.Mobile_markAllAsRead = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]

  const markAllAsRead = async (userId) => {
    try {
      const result = await notifications.updateMany({notif_to : userId, isRead : false}, {$set : {isRead : true}})
      return res.status(200).json({message : "success"})
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
      
      markAllAsRead(user._id)
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
}

module.exports.Mobile_countUnreadNotifs = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]

  const countNotifs = async (userId) => {
    try {
      const result = await notifications.countDocuments({notif_to : userId, isRead : false})
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
      
      countNotifs(user._id)
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

}

module.exports.Mobile_deleteNotif = async (req,res) => {
  const accessToken = req.headers.authorization.split(' ')[1]
  const {notifId} = req.params
  const deeletNotif = async (userId) => {
    try {
      const result = await notifications.findByIdAndDelete(notifId)
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
      
      deeletNotif(user._id)
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

}