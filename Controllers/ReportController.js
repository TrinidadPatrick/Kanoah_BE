const reports = require('../Models/ReportModel')
const services = require('../Models/ServiceModel')
const jwt = require('jsonwebtoken')

module.exports.AddReport = async (req,res) => {
    const accessToken = req.cookies.accessToken
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

module.exports.AdminGetPendingReports = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken

    const getReports = async (user) => {
        if(user.Role === "SuperAdmin" || user.Role === "Admin")
        {
            try {
                const result = await reports.find({status : "Pending"}).populate('reportedBy', 'firstname lastname profileImage')
                if(result)
                {
                    return res.status(200).json(result)
                }
            } catch (error) {
                return res.status(404).json(error);
            }
        }
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      try {
        jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
          if(err)
          {
              return res.status(403).json({ error: 'Forbidden' });
          }
          
          getReports(user);
        });
      } catch (err) {
          
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
        
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}

module.exports.AdminGetReportHistory = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken

  const getReportHistory = async (user) => {
      if(user.Role === "SuperAdmin" || user.Role === "Admin")
      {
          try {
              const result = await reports.find({$or : [{status : "Accepted"}, {status : "Rejected"}]}).populate('reportedBy', 'firstname lastname profileImage')
              if(result)
              {
                  return res.status(200).json(result)
              }
          } catch (error) {
              return res.status(404).json(error);
          }
      }
      return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
        if(err)
        {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        getReportHistory(user);
      });
    } catch (err) {
        
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
      
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
}
module.exports.AdminGetAllReportCounts = async (req,res) => {
  const accessToken = req.cookies.adminAccessToken
  const {year} = req.params


  const getReportHistory = async (user) => {
      if(user.Role === "SuperAdmin" || user.Role === "Admin")
      {
          try {
              const result = await reports.find({
                createdAt: { $regex: new RegExp('^' + year) }
              })
              if(result)
              {
                  return res.status(200).json(result)
              }
          } catch (error) {
              return res.status(400).json(error);
          }
      }
      return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
        if(err)
        {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        getReportHistory(user);
      });
    } catch (err) {
        
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
      
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
}

module.exports.AdminUpdateReport = async (req,res) => {
    const accessToken = req.cookies.adminAccessToken
    const {_id} = req.params
    const stat = req.body.status

    const updateReport = async () => {
        try {
            const result = await reports.findByIdAndUpdate(_id, { $set : {status : stat}})
            return res.status(200).json({message : "Success"})
        } catch (error) {
            return res.status(404).json({ error: error });
        }
    }

    if (!accessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    
      try {
        jwt.verify(accessToken, process.env.ADMIN_SECRET_KEY, (err, user)=>{
          if(err)
          {
              return res.status(403).json({ error: 'Forbidden' });
          }
          
          updateReport(user);
        });
      } catch (err) {
          
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        } else {
        
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
}