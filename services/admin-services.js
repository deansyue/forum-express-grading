// 引入model
const { Restaurant, Category } = require('../models')
// 引入file-helpers
const { imgurFileHandler } = require('../helpers/file-helpers')

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

  // 新增餐廳路由
  postRestaurant: (req, cb) => {
    // 取得表單資料
    const { name, tel, address, description, openingHours, categoryId } = req.body

    // 判斷name欄位是否有值，若無則丟出Error物件
    if (!name) throw new Error('Restaurant name is required')

    // 取得在middleware/multer處理過放在req.file裡的圖片資料
    const { file } = req

    // 呼叫localFileHandler處理圖片檔案
    imgurFileHandler(file)
      // 取得圖片路徑後，將全部資料新增至資料庫
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        description,
        openingHours,
        image: filePath || null,
        categoryId
      }))
      .then(newRestaurant => {
        // 回傳物件
        cb(null, { restaurant: newRestaurant })
      })
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
