
const {Router} = require('express')
const { loginasAdmin, addAdmin, logout, checkStatus, getAdminInfo, getAdmins, refreshAdmin, addCategory, getCategories, updateCategories, editFeatureOption, deleteCategory, UpdateAdmin, DisableAdmin, EnableAdmin, UpdateSuperAdmin, AdminGetAllBookings, AdminGetAllReviews, AdminDashboard_GetAllBookings } = require('../Controllers/AdminController')
const { Admin_GetServices, Admin_DisableService, Admin_EnableService, Admin_ViewService, AdminDashboard_GetServices } = require('../Controllers/Admin_ServicesController')
const { Admin_GetUserLists, Admin_DisableUser, Admin_EnableUser, AdminDashboard_GetUserLists } = require('../Controllers/Admin_UsersController')
const { addBooking, CLIENT_getPendingBooking, respondBooking, getBookingSchedules, getPendingBooking, getAcceptedBooking, getRejectedBooking, getBookingHistory, CLIENT_getToPayBooking, CLIENT_getAcceptedBooking, CLIENT_getRejectedBooking, CLIENT_getHistoryBooking, getPendingPaymentBooking, CLIENT_getInProgressBooking, CLIENT_getCompletedBooking, CLIENT_getCancelledBooking, getInProgressBooking, getCompletedBooking, getCancelledBooking } = require('../Controllers/BookingsController')
const { getAllChats, sendChat, getUserChats, readChat, deleteConvo } = require('../Controllers/ChatController')
const { addToDoNotShow, getDoNotShow, removeDoNotShow } = require('../Controllers/DoNotShowController')
const { addFavorites, getFavorites, removeFavorites } = require('../Controllers/FavoritesController')
const { payGcash, checkPaymentStatus } = require('../Controllers/GcashController')
const { fetchAllUsers, getReceiver, getServiceFromChat, sendMessage, retrieveContacts, getMessages, getAllMessages, handleReadMessage, viewChatMemberProfile, handleDeleteConversation, checkUnreadMessages,  } = require('../Controllers/MessageController')
const { addNotification, getNotifications, markAsRead, countUnreadNotifs, markAllAsRead } = require('../Controllers/NotificationController')
const { AddRating, getAllRatings, getUserRatings, getServiceRatings, removeRating, restoreRating, getServiceRatingWithFilter, AdminDashboard_GetRatings } = require('../Controllers/RatingController')
const { getServices, addService, getService, addGalleryImage, getGalleryImages, deleteImage, deleteMultipleImages, addFeaturedImage, getFeaturedImages, deleteFeaturedImage, deleteMultipleFeaturedImages, updateProfilePicture, getServiceInfo, getServiceProfile, updateService } = require('../Controllers/ServiceController')
const { countBookings, countRatings, getRatingAverage, getTotalSales, getMonthlySales, getMonthlyBookings, getDBBookings, getDBServiceOffers } = require('../Controllers/ServiceDashboardController')
const {register, verifyEmail, verifyOTP, login, forgotPassword, newPassword, submitOtpForNewPassword, verifyUsername, getUsers, getUser, updateUser, verifyPassword, updatePassword, deactivateAccount, refresh, profile, handleFb, handleFbLogin, getUserInfo, userLogout} = require('../Controllers/UserController')
const { Mobile_GetServices, Mobile_GetServicesByFilter } = require('../MobileControllers/MobileServiceController')
const { Mobile_login, Mobile_getUser, Mobile_updateProfile } = require('../MobileControllers/UserController')
const { AddReport, AdminGetReports, AdminUpdateReport, AdminGetPendingReports, AdminGetReportHistory, AdminGetAllReportCounts } = require('../Controllers/ReportController')
const { AdminAddNotification } = require('../Controllers/Admin_NotificationController')
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
router.patch('/UpdateAdmin/:_id', UpdateAdmin)
router.patch('/DisableAdmin/:_id', DisableAdmin)
router.patch('/EnableAdmin/:_id', EnableAdmin)
router.patch('/UpdateSuperAdmin', UpdateSuperAdmin)
router.get('/logout', logout)
router.get('/checkStatus', checkStatus)
router.get('/refreshAdmin', refreshAdmin)
router.get('/getAdminInfo', getAdminInfo)
router.get('/getAdmins', getAdmins)
router.post('/addCategory', addCategory)
router.get('/getCategories', getCategories)
router.put('/updateCategories', updateCategories)
router.patch('/editFeatureOption/:category_id', editFeatureOption)
router.patch('/deleteCategory/:category_id', deleteCategory)
router.get('/Admin_GetServices', Admin_GetServices)
router.patch('/Admin_DisableService/:serviceId', Admin_DisableService)
router.patch('/Admin_EnableService/:serviceId', Admin_EnableService)
router.get('/Admin_ViewService/:_id', Admin_ViewService)
router.get('/Admin_GetUserLists', Admin_GetUserLists)
router.patch('/Admin_DisableUser/:userId', Admin_DisableUser)
router.patch('/Admin_EnableUser/:userId', Admin_EnableUser)
router.get('/AdminGetPendingReports', AdminGetPendingReports)
router.get('/AdminGetReportHistory', AdminGetReportHistory)
router.patch('/AdminUpdateReport/:_id', AdminUpdateReport)
router.post('/AdminAddNotification', AdminAddNotification)
router.get('/AdminGetAllBookings', AdminGetAllBookings)
router.get('/AdminGetAllReviews', AdminGetAllReviews)

// Admin Dashboard Routes
router.get('/AdminDashboard_GetServices/:year', AdminDashboard_GetServices)
router.get('/AdminDashboard_GetUserLists/:year', AdminDashboard_GetUserLists)
router.get('/AdminGetAllReportCounts/:year', AdminGetAllReportCounts)
router.get('/AdminDashboard_GetAllBookings/:year', AdminDashboard_GetAllBookings)
router.get('/AdminDashboard_GetRatings/:year', AdminDashboard_GetRatings)

// Booking Route
router.get('/getBookingSchedules/:shop_id', getBookingSchedules)
router.post('/addBooking', addBooking)
router.get('/CLIENT_getInProgressBooking', CLIENT_getInProgressBooking)
router.get('/CLIENT_getCompletedBooking', CLIENT_getCompletedBooking)
router.get('/CLIENT_getCancelledBooking', CLIENT_getCancelledBooking)
router.get('/CLIENT_getHistoryBooking', CLIENT_getHistoryBooking)


router.get('/getCompletedBooking/:_id', getCompletedBooking)
router.get('/getCancelledBooking/:_id', getCancelledBooking)
router.get('/getBookingHistory/:_id', getBookingHistory)
router.get('/getInProgressBooking/:_id', getInProgressBooking)
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

// Rating route
router.post('/AddRating', AddRating)
router.get('/getUserRatings', getUserRatings)
router.get('/getServiceRatings/:service', getServiceRatings)
router.get('/getServiceRatingWithFilter', getServiceRatingWithFilter)
router.get('/getAllRatings', getAllRatings)
router.patch('/removeRating/:ratingId', removeRating)
router.patch('/restoreRating/:ratingId', restoreRating)

// Notification Route
router.post('/addNotification', addNotification)
router.get('/getNotifications', getNotifications)
router.patch('/markAsRead', markAsRead)
router.get('/countUnreadNotifs', countUnreadNotifs)
router.patch('/markAllAsRead', markAllAsRead)


// DashBoard Route
router.get('/countBookings', countBookings)
router.get('/countRatings', countRatings)
router.get('/getRatingAverage', getRatingAverage)
router.get('/getTotalSales', getTotalSales)
router.get('/getMonthlySales', getMonthlySales)
router.get('/getMonthlyBookings', getMonthlyBookings)
router.get('/getDBBookings', getDBBookings)
router.get('/getDBServiceOffers', getDBServiceOffers)

// Report Routes
router.post('/AddReport', AddReport)

// MOBILE ROUTESS

router.post("/loginMobile", Mobile_login)
router.get("/Mobile_getUser", Mobile_getUser)
router.patch("/Mobile_updateProfile", Mobile_updateProfile)


// Service Routes
router.get("/Mobile_GetServices", Mobile_GetServices)
router.get("/Mobile_GetServicesByFilter", Mobile_GetServicesByFilter)

module.exports = router;