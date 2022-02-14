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
  }
}

// 匯出模組
module.exports = adminServices
