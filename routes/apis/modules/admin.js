// 引入模組
const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer')

const adminController = require('../../../controllers/apis/admin-controller')

// 設定admin路由
router.delete('/restaurants/:rest_id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)

// 匯出模組
module.exports = router
