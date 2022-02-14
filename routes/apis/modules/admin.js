// 引入模組
const express = require('express')
const router = express.Router()

const adminController = require('../../../controllers/apis/adminController')

// 設定admin路由
router.get('/restaurants', adminController.getRestaurants)

// 匯出模組
module.exports = router
