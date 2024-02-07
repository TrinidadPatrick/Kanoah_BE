const notifications = require('../Models/NotificationModel')
const jwt = require('jsonwebtoken')

module.exports.addNotification = async (req,res) => {
    const {notification_type, createdAt, content, client, notif_to, reference_id} = req.body

    try {
        const result = await notifications.create({
            notification_type, createdAt, content, client, notif_to, reference_id
        })

        return res.status(200).json({status : "Success"})
    } catch (error) {
        return res.status(500).json({message : error})
    }
}


module.exports.getNotifications = async (req,res) => {

    const accessToken = req.cookies.accessToken

    const getNotif = async (userId) => {
        try {
            const result = await notifications.find({notif_to : userId})

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


module.exports.markAsRead = async (req,res) => {
    const accessToken = req.cookies.accessToken
    const notification_id = req.body.notification_id
    const notif_to = req.body.notif_to

    // console.log(accessToken)
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