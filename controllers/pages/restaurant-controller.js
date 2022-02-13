// 引入model
const { Restaurant, Category, User, Comment } = require('../../models')
// 引入模組
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  // 瀏覽餐廳頁面
  getRestaurants: (req, res, next) => {
    // 使用共用方法restaurantServices.getRestaurants傳入req參數，回傳err與data參數，若有error則回傳error，若無則渲染畫面傳入data
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },

  // 瀏覽特定餐廳詳細資訊
  getRestaurant: (req, res, next) => {
    // 查詢動態id的restaurant資料，並關連category
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        // 使用多對多關連User
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    })
      .then(restaurant => {
        // 若查詢不到資料，回傳錯誤訊息
        if (!restaurant) throw new Error("Restaurant doesn't exist!")

        // 更新資料庫viewCounts值 + 1
        return restaurant.increment('viewCounts')
      })
      // 渲染restaurant頁面，將參數轉換成普通物件並帶入
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(fu => fu.id === req.user.id) // 判斷FavoritedUsers是否存在登入者的id
        const isLiked = restaurant.LikedUsers.some(lu => lu.id === req.user.id) // 判斷LikedUsers是否存在登入者的id
        res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => next(err))
  },

  // 瀏覽特定餐廳的點擊次數
  getDashboard: (req, res, next) => {
    // 查詢動態路由的restaurant資料，並關聯category
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        // 若查詢不到資料，回傳錯誤訊息
        if (!restaurant) throw new Error("Restaurant doesn't exist!")

        // 渲染dashboard頁面，並帶入參數
        return res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },

  // 瀏覽feeds頁面
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({ // 查詢10筆餐餐，以createdAt降冪排列
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({ // 查詢10筆評論，以createdAt降冪排列
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        return res.render('feeds', { restaurants, comments })
      })
  },

  // 瀏覽top餐廳頁面
  getTopRestaurants: (req, res, next) => {
    const length = 10 // 顯示資料的筆數
    const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id) // 取得user.FavoritedRestaurants的餐廳id

    // 查詢restaurant全部資料，並多對多關連user
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        // 整理restaurant資料
        const data = restaurants.map(restaurant => ({
          ...restaurant.toJSON(), // 將restaurant轉換成普通物件
          description: restaurant.description.substring(0, 40) + '...', // 將description截取40個字
          favoritedCount: restaurant.FavoritedUsers.length, // 取得restaurant被追蹤的數字
          isFavorited: favoritedRestaurantsId?.includes(restaurant.id) || false // 判斷該餐廳是否被登入者追蹤
        }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount) // 按追蹤人數降冪排列
          .slice(0, length) // 取得restaurants陣列的前10筆

        return res.render('top-restaurants', { restaurants: data })
      })
      .catch(err => next(err))
  }
}

// 匯出模組
module.exports = restaurantController
