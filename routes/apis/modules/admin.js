// 引入模組
const express = require('express')
const router = express.Router()

const adminController = require('../../../controllers/apis/admin-controller')

// 設定admin路由
router.delete('/restaurants/:rest_id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)

// 匯出模組
module.exports = router
