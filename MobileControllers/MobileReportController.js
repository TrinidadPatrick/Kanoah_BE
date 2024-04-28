const reports = require('../Models/ReportModel')
const services = require('../Models/ServiceModel')
const jwt = require('jsonwebtoken')

module.exports.Mobile_AddReport = async (req,res) => {
    const accessToken = req.headers.authorization.split(" ")[1]
    const {service,reasons,textDetails,photos,createdAt} = req.body

    const addReport = async (userId) => {
        try {
            const result = await reports.create({service,reasons,textDetails,photos,createdAt, reportedBy : userId})
            return res.status(200).json({message : "Reported successfull"})
        } catch (error) {
            return res.status(400).json(error)
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
          
          addReport(user._id);
        });
      } catch (err) {
          
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}