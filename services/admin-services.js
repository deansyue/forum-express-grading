// 引入model
const { Restaurant, Category } = require('../models')

const adminServices = {
  // 瀏覽後台網頁
  getRestaurants: cb => {
    // 查詢Restaurant所有資料
    Restaurant.findAll({
      // 去除sequelize物件實例
      raw: true,
      // 將關連的資料包成一個物件
      nest: true,
      // 關連Category
      include: [Category]
    })
      // 回傳資料
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  },

  // 刪除資料路由
  deleteRestaurant: (req, cb) => {
    // 使用動態id查詢資料庫資料
    return Restaurant.findByPk(req.params.rest_id)
      .then(restaurant => {
        // 判斷是否有資料，若無丟出Error物件
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        // 若有資料，刪除該資料
        return restaurant.destroy()
      })
      // 重新導向admin/restaurants
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  }
}

// 匯出模組
module.exports = adminServices
