// 引入model
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  // 瀏覽餐廳頁面
  getRestaurants: (req, res, next) => {
    // 使用共用方法restaurantServices.getRestaurants傳入req參數，回傳err與data參數，若有error則回傳error，若無則將data回傳json物件
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },

  getTopRestaurants: (req, res, next) => {
    restaurantServices.getTopRestaurants(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },

  // 瀏覽各別餐廳頁面
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },

  // 瀏覽特定餐廳的點擊次數
  getDashboard: (req, res, next) => {
    restaurantServices.getDashboard(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

// 匯出模組
module.exports = restaurantController
