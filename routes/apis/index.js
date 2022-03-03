// 匯入套件
const express = require('express')
const router = express.Router()
const passport = require('passport')

const admin = require('./modules/admin')

// 引入模組
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const restController = require('../../controllers/apis/restaurant-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')

// 建立admin相關路由
router.use('/admin', authenticated, authenticatedAdmin, admin)

// signup相關路由
router.post('/signup', userController.signUp)

// signin相關路由
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
router.get('/restaurants/topRestaurants', authenticated, restController.getTopRestaurants)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants', authenticated, restController.getRestaurants)

router.get('/comments/:restId', authenticated, commentController.getComment)
router.delete('/comments/:id', authenticated, authenticatedAdmin, commentController.deleteComment)
router.post('/comments', authenticated, commentController.postComment)

router.use('/', apiErrorHandler)

// 匯出模組
module.exports = router
