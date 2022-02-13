// 匯入套件
const express = require('express')
const router = express.Router()

// 引入模組
const restController = require('../../controllers/apis/restaurant-controller')

router.get('/restaurants', restController.getRestaurants)

// 匯出模組
module.exports = router
