
const {Router} = require('express')
const { loginasAdmin, addAdmin, logout, checkStatus, getAdminInfo, getAdmins, refreshAdmin, addCategory, getCategories, updateCategories } = require('../Controllers/AdminController')
const { addBooking, CLIENT_getPendingBooking, respondBooking, getBookingSchedules, getPendingBooking, getAcceptedBooking, getRejectedBooking, getBookingHistory, CLIENT_getToPayBooking, CLIENT_getAcceptedBooking, CLIENT_getRejectedBooking, CLIENT_getHistoryBooking, getPendingPaymentBooking } = require('../Controllers/BookingsController')
const { getAllChats, sendChat, getUserChats, readChat, deleteConvo } = require('../Controllers/ChatController')
const { addToDoNotShow, getDoNotShow, removeDoNotShow } = require('../Controllers/DoNotShowController')
const { addFavorites, getFavorites, removeFavorites } = require('../Controllers/FavoritesController')
const { payGcash, checkPaymentStatus } = require('../Controllers/GcashController')
const { fetchAllUsers, getReceiver, getServiceFromChat, sendMessage, retrieveContacts, getMessages, getAllMessages, handleReadMessage, viewChatMemberProfile, handleDeleteConversation, checkUnreadMessages,  } = require('../Controllers/MessageController')
const { getServices, addService, getService, addGalleryImage, getGalleryImages, deleteImage, deleteMultipleImages, addFeaturedImage, getFeaturedImages, deleteFeaturedImage, deleteMultipleFeaturedImages, updateProfilePicture, getServiceInfo, getServiceProfile, updateService } = require('../Controllers/ServiceController')
const {register, verifyEmail, verifyOTP, login, forgotPassword, newPassword, submitOtpForNewPassword, verifyUsername, getUsers, getUser, updateUser, verifyPassword, updatePassword, deactivateAccount, refresh, profile, handleFb, handleFbLogin, getUserInfo, userLogout} = require('../Controllers/UserController')
const router = Router()

// User Routes
router.post("/register", register)
router.get("/profile", profile)
router.post("/verifyEmail", verifyEmail)
router.post("/verifyOTP", verifyOTP)
router.post("/login", login)
router.post("/forgotPassword", forgotPassword)
router.post("/forgotPassword/newPassword", newPassword)
router.post("/forgotPassword/sendOtp", submitOtpForNewPassword)
router.post("/verifyUsername", verifyUsername)
router.post("/verifyPassword", verifyPassword)
router.patch("/updatePassword/", updatePassword)
router.patch("/deactivateAccount", deactivateAccount)
router.put("/updateUser/:_id", updateUser)
router.get("/getUsers", getUsers)
router.get("/getUser", getUser)
router.get("/userLogout", userLogout)


//  Service Route
router.get("/getServices", getServices) //Get All Services
router.post("/addService", addService) //Add Service
router.get("/getService/:userId", getService) //Get service by Userid
router.get("/getServiceInfo/:_id", getServiceInfo) //Get service info in view service
router.get("/getServiceProfile", getServiceProfile) //Get service info in profile service
router.patch("/updateService/:userId", updateService) //Get service info in profile service


// Gallery Images ROute
router.patch("/addGalleryImage/:_id", addGalleryImage) //Add images to Gallery
router.get("/getGalleryImages/:userId", getGalleryImages) //Get gallery images
router.post("/deleteImage/", deleteImage) //delete single gallery images
router.post("/deleteMultipleImages/", deleteMultipleImages) //delete multiple gallery images


// Featured Images Route
router.patch("/addFeaturedImage/:_id", addFeaturedImage) //Add images to featured
router.get("/getFeaturedImages/:userId", getFeaturedImages) //get images to featured
router.post("/deleteFeaturedImage/", deleteFeaturedImage) //delete images to featured
router.post("/deleteMultipleFeaturedImages/", deleteMultipleFeaturedImages) //delete images to featured

// Profile Picture of service
router.post("/updateProfilePicture", updateProfilePicture)



// Chat routes
router.get("/getAllChats", getAllChats)
router.post("/sendChat", sendChat)
router.post("/readChat", readChat)
router.get("/getUserChats/:userId", getUserChats)
router.delete("/deleteConvo/:convoId", deleteConvo)

// Messages routes
router.get('/fetchAllUsers/:_id', fetchAllUsers)
router.get('/getReceiver/:userId', getReceiver)
router.get('/getServiceFromChat/:serviceId', getServiceFromChat)
router.post('/sendMessage', sendMessage)
router.get('/retrieveContacts/:_id', retrieveContacts)
router.get('/getMessages/:conversationId/:returnLimit', getMessages)
router.get('/getAllMessages/:_id', getAllMessages)
router.put('/handleReadMessage', handleReadMessage)
router.get('/viewChatMemberProfile/:_id', viewChatMemberProfile)
router.delete('/handleDeleteConversation/:conversationId', handleDeleteConversation)
router.get('/checkUnreadMessages', checkUnreadMessages)

// admin Route
router.post('/loginasAdmin', loginasAdmin)
router.post('/addAdmin', addAdmin)
router.get('/logout', logout)
router.get('/checkStatus', checkStatus)
router.get('/refreshAdmin', refreshAdmin)
router.get('/getAdminInfo', getAdminInfo)
router.get('/getAdmins', getAdmins)
router.post('/addCategory', addCategory)
router.get('/getCategories', getCategories)
router.put('/updateCategories', updateCategories)

// Booking Route
router.get('/getBookingSchedules/:shop_id', getBookingSchedules)
router.post('/addBooking', addBooking)
router.get('/CLIENT_getPendingBooking', CLIENT_getPendingBooking)
router.get('/CLIENT_getToPayBooking', CLIENT_getToPayBooking)
router.get('/CLIENT_getAcceptedBooking', CLIENT_getAcceptedBooking)
router.get('/CLIENT_getRejectedBooking', CLIENT_getRejectedBooking)
router.get('/CLIENT_getHistoryBooking', CLIENT_getHistoryBooking)


router.get('/getAcceptedBooking/:_id', getAcceptedBooking)
router.get('/getRejectedBooking/:_id', getRejectedBooking)
router.get('/getPendingPaymentBooking/:_id', getPendingPaymentBooking)
router.get('/getBookingHistory/:_id', getBookingHistory)
router.get('/getPendingBooking/:_id', getPendingBooking)
router.patch('/respondBooking/:_id', respondBooking)

// Favorite route
router.post('/addFavorites', addFavorites)
router.get('/getFavorites', getFavorites)
router.delete('/removeFavorite/:serviceId', removeFavorites)

// DNS route
router.post('/addToDoNotShow', addToDoNotShow)
router.get('/getDoNotShow', getDoNotShow)
router.delete('/removeDoNotShow/:serviceId', removeDoNotShow)

router.post('/payGcash', payGcash)
router.get('/checkPaymentStatus/:invoiceId', checkPaymentStatus)


module.exports = router;