const notifications = require('../Models/NotificationModel')
const jwt = require('jsonwebtoken')

module.exports.AdminAddNotification = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken
    const {notification_type, createdAt, content, notif_to, reference_id} = req.body

    const addNotif= async (user) => {
        try {
            const result = await notifications.create({
                notification_type, createdAt, content, client : user._id, notif_to, reference_id
            })
    
            return res.status(200).json({status : "Success"})
        } catch (error) {
            return res.status(500).json({message : error})
        }
    }
    

    if(!accessToken)
    {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    else if(accessToken)
    {
        try {
            jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
              if(err)
              {
                  return res.status(200).json({ error: 'access token expired' });
              }
              
              addNotif(user)
            });
          } catch (err) {
              
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Token expired' });
            } else {
              return res.status(403).json({ error: 'Forbidden' });
            }
          }
    }
}