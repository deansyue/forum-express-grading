// 引入model
const adminServices = require('../../services/admin-services')

const adminController = {
  // 瀏覽後台網頁
  getRestaurants: (req, res, next) => {
    // 使用共用方法adminServices.getRestaurants，回傳err與data參數，若有error則回傳error，若無則將data回傳json物件
    adminServices.getRestaurants((err, data) => err ? next(err) : res.json(data))
  }
}

// 匯出模組
module.exports = adminController
