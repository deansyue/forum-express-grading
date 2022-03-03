// 引入model
const { Restaurant, Category, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  // 瀏覽餐廳頁面
  getRestaurants: (req, callback) => {
    // 宣告預設limit變數
    const DEFAULT_LIMIT = 9

    // 取得查詢條資料
    const categoryId = Number(req.query.categoryId) || '' // 查詢條件為字串，先將資料轉成數值再操作
    const page = Number(req.query.page) || 1 // 若無page條件，預設為1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT // 若無limit條件，預設為DEFAULT_LIMIT

    const offset = getOffset(limit, page)

    Promise.all([
      // 尋找全部restaurant資料，並關連category
      Restaurant.findAndCountAll({
        include: Category,
        // 增加查詢條件
        where: {
          ...categoryId ? { categoryId } : {} // 若categoryId為true，回傳物件categoryId，若無回傳空物件，再使用展開運算子展開物件
        },
        limit,
        offset,
        nest: true,
        raw: true
      }),
      // 尋找全部category資料
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        // 先檢查req.user是否有資料，若有則將FavoritedRestaurants的餐廳id取出成陣列
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        // 先檢查req.user是否有資料，若有則將LikedRestaurants的餐廳id取出成陣列
        const likedRestaurantsId = req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []

        // 新增變數data，取得map回傳陣列
        const data = restaurants.rows.map(r => ({
          ...r, // 展開r的物件
          description: r.description.substring(0, 50), // 將餐廳描述截為50字
          isFavorited: favoritedRestaurantsId.includes(r.id), // 判斷favoritedRestaurantsId是否有包含目前餐廳的id，並回傳boolean值
          isLiked: likedRestaurantsId.includes(r.id) // 判斷likedRestaurantsId是否有包含目前餐廳的id，並回傳boolean值
        }))
        // 渲染restaurants
        return callback(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => callback(err))
  },

  getTopRestaurants: (req, cb) => {
    const length = req.query.length ? Number(req.query.length) : {}

    Restaurant.findAll({
      limit: length,
      order: length ? [['createdAt', 'DESC']] : [],
      raw: true
    })
      .then(restaurants => cb(null, { restaurant: restaurants }))
      .catch(err => cb(err))
  },

  // 瀏覽特定餐廳詳細資訊
  getRestaurant: (req, cb) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
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
        const isFavorited = restaurant.FavoritedUsers?.some(fu => fu.id === req.user.id) // 判斷FavoritedUsers是否存在登入者的id
        const isLiked = restaurant.LikedUsers?.some(lu => lu.id === req.user.id) // 判斷LikedUsers是否存在登入者的id
        cb(null, { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
      .catch(err => cb(err))
  },

  // 瀏覽特定餐廳的點擊次數
  getDashboard: (req, cb) => {
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
        return cb(null, { restaurant })
      })
      .catch(err => cb(err))
  }
}

// 匯出模組
module.exports = restaurantServices
