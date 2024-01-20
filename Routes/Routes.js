
const {Router} = require('express')
const { loginasAdmin, addAdmin, logout, checkStatus, getAdminInfo, getAdmins, refreshAdmin, addCategory, getCategories, updateCategories } = require('../Controllers/AdminController')
const { addBooking, getBooking, respondBooking, getBookingSchedules, getPendingBooking, getAcceptedBooking, getRejectedBooking, getBookingHistory } = require('../Controllers/BookingsController')
const { getAllChats, sendChat, getUserChats, readChat, deleteConvo } = require('../Controllers/ChatController')
const { fetchAllUsers, getReceiver, getServiceFromChat, sendMessage, retrieveContacts, getMessages, getAllMessages, handleReadMessage, viewChatMemberProfile, handleDeleteConversation,  } = require('../Controllers/MessageController')
const { payment } = require('../Controllers/PaymentController')
const { getServices, addService, getService, addGalleryImage, getGalleryImages, deleteImage, deleteMultipleImages, addFeaturedImage, getFeaturedImages, deleteFeaturedImage, deleteMultipleFeaturedImages, updateProfilePicture, getServiceInfo, getServiceProfile, updateService } = require('../Controllers/ServiceController')
const router = Router()
const {register, verifyEmail, verifyOTP, login, forgotPassword, newPassword, submitOtpForNewPassword, verifyUsername, getUsers, getUser, updateUser, verifyPassword, updatePassword, deactivateAccount, refresh, profile, handleFb, handleFbLogin, getUserInfo, userLogout} = require('../Controllers/UserController')

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
router.get('/getBooking', getBooking)
router.get('/getAcceptedBooking/:_id', getAcceptedBooking)
router.get('/getRejectedBooking/:_id', getRejectedBooking)
router.get('/getBookingHistory/:_id', getBookingHistory)
router.get('/getPendingBooking/:_id', getPendingBooking)
router.patch('/respondBooking/:_id', respondBooking)


module.exports = router;