// 匯入套件
const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')

// 引入模組
const restController = require('../../controllers/apis/restaurant-controller')
const { apiErrorHandler } = require('../../middleware/error-handler')

// 建立admin相關路由
router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

router.use('/', apiErrorHandler)

// 匯出模組
module.exports = router
