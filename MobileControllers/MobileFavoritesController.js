const DoNotShow = require("../Models/DoNotShowModel")
const favorites = require("../Models/FavoritesModel")
const jwt = require("jsonwebtoken")

module.exports.Mobile_getFavorites = async (req,res) => {
    const accessToken = req.headers.authorization.split(' ')[1]

    const getFavorite = async (userId) => {
        try {
            const result = await favorites.find({userId : userId})
            .populate(
              {
                path : 'service',
                select : 'basicInformation serviceProfileImage owner createdAt',
                populate : {
                  path : 'owner',
                  model : 'User_Info',
                  select : 'firstname lastname'

                }
              }
              )
            if(result)
            {
                return res.status(200).json(result)
            }
            return res.status(500).json({ error: error });
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
          
          getFavorite(user._id);
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