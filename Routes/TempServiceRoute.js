const {Router} = require('express')
const { getTempServices } = require('../Controllers/TempServiceController')
const router = Router()

// For services
router.get("/getTempServices", getTempServices) //Get All Temp Services



module.exports = router;